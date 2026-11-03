import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { EventsFile, SortieEvent, SourceReport, UsefulLink, WatchPost } from "@shared/event";
import autoAdapter from "./adapters/auto";
import customAdapter from "./adapters/custom";
import icalAdapter from "./adapters/ical";
import jsonLdAdapter from "./adapters/jsonld";
import redditAdapter from "./adapters/reddit";
import wpTribeAdapter from "./adapters/wpTribe";
import FetchHttpClient from "./http";
import { dedupe } from "./pipeline/dedupe";
import { normalize, type Window } from "./pipeline/normalize";
import { SOURCES } from "./sources";
import type { Adapter, SourceConfig, SourceKind } from "./types";

const OUTPUT_PATH = "public/data/events.json";
/** HTML of sources that yield nothing, saved so custom readers can be written from real pages. */
const SNAPSHOT_DIR = "snapshots";
const SNAPSHOT_MAX_CHARS = 400_000;
const SAME_HOST_DELAY_MS = 3_000;
const WINDOW_DAYS = 45;
const CONCURRENCY = 4;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const ADAPTERS: Record<SourceKind, Adapter> = {
  "auto": autoAdapter,
  "custom": customAdapter,
  "ical": icalAdapter,
  "jsonld": jsonLdAdapter,
  "wp-tribe": wpTribeAdapter,
  "reddit": redditAdapter,
};

interface SourceOutcome {
  events: SortieEvent[];
  watch: WatchPost[];
  links: UsefulLink[];
  report: SourceReport;
}

async function readPrevious(): Promise<EventsFile | null> {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, "utf8")) as EventsFile;
  } catch {
    return null;
  }
}

async function runSource(source: SourceConfig, window: Window, previous: EventsFile | null): Promise<SourceOutcome> {
  const http = new FetchHttpClient();
  const report: SourceReport = {
    id: source.id, name: source.name, kind: source.kind,
    ok: true, eventCount: 0, keptCount: 0, error: null, usedFallback: false,
  };
  try {
    const result = await ADAPTERS[source.kind](source, http);
    const events = result.events.map((raw) => normalize(raw, source, window)).filter((e): e is SortieEvent => e !== null);
    report.eventCount = result.events.length;
    report.keptCount = events.length;
    if (result.snapshotText) await saveText(`${source.id}.txt`, result.snapshotText);
    return { events, watch: result.watch ?? [], links: result.links ?? [], report };
  } catch (error) {
    report.ok = false;
    report.error = error instanceof Error ? error.message : String(error);
    // Keep last week's still-upcoming events so a broken site does not empty the dashboard
    const fallback = (previous?.events ?? []).filter(
      (e) => e.sources.some((s) => s.id === source.id) && Date.parse(e.end ?? e.start) >= window.from.getTime(),
    );
    report.usedFallback = fallback.length > 0;
    report.keptCount = fallback.length;
    return { events: fallback, watch: [], links: [], report };
  }
}

async function saveText(name: string, text: string): Promise<void> {
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await writeFile(`${SNAPSHOT_DIR}/${name}`, text.slice(0, SNAPSHOT_MAX_CHARS));
}

async function saveSnapshot(source: SourceConfig): Promise<void> {
  try {
    const html = await new FetchHttpClient().getText(source.url);
    await mkdir(SNAPSHOT_DIR, { recursive: true });
    await writeFile(`${SNAPSHOT_DIR}/${source.id}.html`, html.slice(0, SNAPSHOT_MAX_CHARS));
  } catch {
    // Nothing to save when the page itself is unreachable
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Groups sources by host so one server never gets two crawls at once (Shotgun answered 429). */
function groupByHost(sources: SourceConfig[]): SourceConfig[][] {
  const groups = new Map<string, SourceConfig[]>();
  for (const source of sources) {
    const host = new URL(source.url).host;
    groups.set(host, [...(groups.get(host) ?? []), source]);
  }
  return [...groups.values()];
}

/** Runs tasks with a small concurrency limit, to stay polite with small venue servers. */
async function runPool<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  const now = new Date();
  const from = new Date(now);
  from.setUTCHours(0, 0, 0, 0);
  const window: Window = { from, to: new Date(from.getTime() + WINDOW_DAYS * DAY_IN_MS) };
  const previous = await readPrevious();
  const sources = SOURCES.filter((s) => s.enabled);

  const groups = groupByHost(sources);
  const grouped = await runPool(groups, CONCURRENCY, async (group) => {
    const results: SourceOutcome[] = [];
    for (const [index, source] of group.entries()) {
      if (index > 0) await sleep(SAME_HOST_DELAY_MS);
      const outcome = await runSource(source, window, previous);
      if (outcome.report.ok && (outcome.report.keptCount === 0 || source.snapshot)) await saveSnapshot(source);
      results.push(outcome);
    }
    return results;
  });
  const order = new Map(sources.map((s, i) => [s.id, i]));
  const outcomes = grouped.flat().sort((a, b) => (order.get(a.report.id) ?? 0) - (order.get(b.report.id) ?? 0));
  const events = dedupe(outcomes.flatMap((o) => o.events)).sort((a, b) => a.start.localeCompare(b.start));
  const watch = outcomes.flatMap((o) => o.watch).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const file: EventsFile = {
    generatedAt: now.toISOString(),
    windowDays: WINDOW_DAYS,
    events,
    watch,
    links: outcomes.flatMap((o) => o.links),
    sources: outcomes.map((o) => o.report),
  };
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(file, null, 2)}\n`);

  const okCount = outcomes.filter((o) => o.report.ok).length;
  console.info(`[crawl] ${events.length} événements, ${watch.length} posts, sources OK ${okCount}/${sources.length}`);
  for (const { report } of outcomes) {
    const status = report.ok ? "OK " : "ERR";
    console.info(`[crawl] ${status} ${report.id}: ${report.keptCount}/${report.eventCount}${report.error ? ` – ${report.error}` : ""}`);
  }
}

main().catch((error) => {
  console.error("[crawl] fatal", error);
  process.exit(1);
});
