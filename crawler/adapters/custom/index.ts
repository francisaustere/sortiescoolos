import type { RawEvent } from "@shared/event";
import type { Adapter } from "../../types";
import { parseEventPost } from "./eventPost";
import { parseLesTheatres } from "./lesTheatres";
import { parseMilleBabords } from "./milleBabords";
import { parseMolotov } from "./molotov";

type HtmlParser = (html: string, baseUrl: string) => RawEvent[];

/** Hand-written readers for sites without structured data, keyed by source id. */
export const CUSTOM_PARSERS: Record<string, HtmlParser> = {
  "mille-babords": parseMilleBabords,
  "molotov": parseMolotov,
  "les-theatres": parseLesTheatres,
  "videodrome2": parseEventPost,
};

const customAdapter: Adapter = async (source, http) => {
  const parser = CUSTOM_PARSERS[source.id];
  if (!parser) throw new Error(`Pas de lecteur sur mesure pour ${source.id}`);
  return { events: parser(await http.getText(source.url), source.url) };
};

export default customAdapter;
