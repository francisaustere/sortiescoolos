import type { HttpClient } from "./types";

const TIMEOUT_MS = 20_000;
const USER_AGENT = "SortiesCoolBot/0.1 (agenda perso, 1 passage par semaine; +https://github.com/francisaustere/sortiescoolos)";

/** Polite HTTP client: one identifiable user agent, timeout, no retries hammering servers. */
export default class FetchHttpClient implements HttpClient {

  public async getText(url: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "fr-FR,fr;q=0.9" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "follow",
      });
    } catch (error) {
      // Node hides the useful part (DNS, TLS, timeout) in error.cause
      const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : null;
      throw new Error(`Réseau injoignable (${cause ?? (error instanceof Error ? error.message : String(error))}) sur ${url}`);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status} on ${url}`);
    return response.text();
  }
}
