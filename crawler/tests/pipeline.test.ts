import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseIcs } from "../adapters/ical";
import { extractJsonLdEvents, extractLinks } from "../adapters/jsonld";
import { parseRedditListing } from "../adapters/reddit";
import { parseTribeResponse } from "../adapters/wpTribe";
import { dedupe } from "../pipeline/dedupe";
import { normalize } from "../pipeline/normalize";
import type { SourceConfig } from "../types";
import { parisLocalToIso, toUtcIso } from "../utils/date.utils";

const fixture = (name: string): string => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

const SOURCE: SourceConfig = {
  id: "test", name: "Test", kind: "ical", url: "https://example.org", venueTags: ["militant"], enabled: true,
};
const WINDOW = { from: new Date("2026-11-01T00:00:00Z"), to: new Date("2026-12-31T00:00:00Z") };

describe("dates", () => {
  it("converts Paris wall time to UTC across DST", () => {
    expect(parisLocalToIso(2026, 11, 12, 19, 30)).toBe("2026-11-12T18:30:00.000Z");
    expect(parisLocalToIso(2026, 7, 1, 20, 0)).toBe("2026-07-01T18:00:00.000Z");
  });
  it("reads offset-less ISO as Paris time", () => {
    expect(toUtcIso("2026-11-12 19:30:00")).toBe("2026-11-12T18:30:00.000Z");
    expect(toUtcIso("2026-11-14T20:30:00+01:00")).toBe("2026-11-14T19:30:00.000Z");
  });
});

describe("ical adapter", () => {
  const events = parseIcs(fixture("sample.ics"));
  it("parses folded lines, escapes and TZID", () => {
    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe("Conférence : sociologie des luttes urbaines, avec débat");
    expect(events[0]?.start).toBe("2026-11-12T18:30:00.000Z");
    expect(events[0]?.description).toContain("quartiers populaires");
    expect(events[1]?.start).toBe("2026-12-05");
  });
  it("scores a left-wing sociology talk high and drops Aubagne", () => {
    const talk = normalize(events[0]!, SOURCE, WINDOW);
    expect(talk?.categories[0]).toBe("conference");
    expect(talk?.isFree).toBe(true);
    expect(talk?.scoreReasons).toEqual(expect.arrayContaining(["sociologie", "politique", "lieu militant"]));
    expect(talk!.score).toBeGreaterThanOrEqual(6);
    expect(normalize(events[1]!, SOURCE, WINDOW)).toBeNull();
  });
});

describe("jsonld adapter", () => {
  const html = fixture("jsonld.html");
  it("finds events inside @graph and survives broken blocks", () => {
    const events = extractJsonLdEvents(html, "https://example.org");
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toBe("Concert punk & slam");
    expect(events[0]?.postalCode).toBe("13003");
    expect(events[0]?.priceText).toBe("8 EUR");
  });
  it("extracts absolute links", () => {
    expect(extractLinks(html, "a[href*='evenement']", "https://example.org/agenda")).toEqual(["https://example.org/evenement/2"]);
  });
});

describe("wp-tribe adapter", () => {
  it("maps The Events Calendar API", () => {
    const { events } = parseTribeResponse({
      events: [{ title: "Balade sonore &#8211; oiseaux", start_date: "2026-11-20 08:00:00", all_day: false, venue: { venue: "Frioul", city: "Marseille", zip: "13007" }, image: false }],
    });
    expect(events[0]?.title).toBe("Balade sonore – oiseaux");
    expect(normalize(events[0]!, SOURCE, WINDOW)?.categories).toContain("nature");
  });
});

describe("sciences", () => {
  it("tags a Pint of Science talk as sciences and scores it", () => {
    const talk = normalize({ title: "Pint of Science : neurosciences et sommeil", start: "2026-11-20T19:30:00", address: "13001 Marseille" }, { ...SOURCE, venueTags: [] }, WINDOW);
    expect(talk?.categories).toContain("sciences");
    expect(talk?.scoreReasons).toContain("sciences");
  });
});

describe("reddit adapter", () => {
  it("keeps only recent event-like posts", () => {
    const now = Date.parse("2026-11-03T12:00:00Z");
    const post = (id: string, title: string, daysAgo: number) => ({
      data: { id, title, permalink: `/r/marseille/${id}`, created_utc: (now - daysAgo * 86_400_000) / 1000 },
    });
    const watch = parseRedditListing({ data: { children: [post("a", "Concert ce soir à la Plaine ?", 1), post("b", "Problème de bus", 1), post("c", "Festival", 30)] } }, "r/marseille", now);
    expect(watch.map((w) => w.id)).toEqual(["reddit-a"]);
  });
});

describe("dedupe", () => {
  it("merges the same event from two sources", () => {
    const raw = { title: "Concert X", start: "2026-11-14T20:00:00+01:00", address: "13006 Marseille" };
    const a = normalize(raw, SOURCE, WINDOW)!;
    const b = normalize({ ...raw, description: "Plus long descriptif" }, { ...SOURCE, id: "other", name: "Other" }, WINDOW)!;
    const merged = dedupe([a, b]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.sources.map((s) => s.id).sort()).toEqual(["other", "test"]);
  });
});
