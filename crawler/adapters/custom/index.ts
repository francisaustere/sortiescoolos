import type { RawEvent } from "@shared/event";
import type { Adapter, AdapterResult, HttpClient } from "../../types";
import { parseCourtsApresMidi } from "./courtsApresMidi";
import { parseEventPost } from "./eventPost";
import { parseFriche } from "./friche";
import { parseLesTheatres } from "./lesTheatres";
import { parseMilleBabords } from "./milleBabords";
import { parseMolotov } from "./molotov";
import { readVortex } from "./vortex";

type HtmlParser = (html: string, baseUrl: string) => RawEvent[];
type AsyncReader = (html: string, baseUrl: string, http: HttpClient) => Promise<AdapterResult>;

/** Readers that need extra downloads (PDF agendas…). */
const ASYNC_READERS: Record<string, AsyncReader> = {
  "vortex": readVortex,
};

/** Hand-written readers for sites without structured data, keyed by source id. */
export const CUSTOM_PARSERS: Record<string, HtmlParser> = {
  "mille-babords": parseMilleBabords,
  "molotov": parseMolotov,
  "les-theatres": parseLesTheatres,
  "videodrome2": parseEventPost,
  "friche": parseFriche,
  "courts-apres-midi": parseCourtsApresMidi,
};

const customAdapter: Adapter = async (source, http) => {
  const html = await http.getText(source.url);
  const asyncReader = ASYNC_READERS[source.id];
  if (asyncReader) return asyncReader(html, source.url, http);
  const parser = CUSTOM_PARSERS[source.id];
  if (!parser) throw new Error(`Pas de lecteur sur mesure pour ${source.id}`);
  return { events: parser(html, source.url) };
};

export default customAdapter;
