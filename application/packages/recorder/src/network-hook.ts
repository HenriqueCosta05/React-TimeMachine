import type { NetworkRequestPayload, NetworkResponsePayload } from "@react-time-machine/shared";
import type { RecordingClock } from "./clock";

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

let nextRequestId = 1;

export interface NetworkHookOptions {
  clock: RecordingClock;
  onRequest: (payload: NetworkRequestPayload, timestamp: number) => void;
  onResponse: (payload: NetworkResponsePayload, timestamp: number) => void;
}

/** Wraps `fetch` to capture request/response pairs with timing. XHR interception
 * is intentionally out of scope for the first cut — `fetch` covers the demo app
 * and most modern data-fetching libraries (RTK Query, React Query, etc). */
export function installNetworkHook(options: NetworkHookOptions): () => void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestId = `req${nextRequestId++}`;
    const request = new Request(input, init);
    const startedAt = options.clock.elapsed();

    options.onRequest(
      {
        requestId,
        url: request.url,
        method: request.method,
        headers: headersToRecord(request.headers),
        body: init?.body != null ? String(init.body) : null,
      },
      startedAt,
    );

    const response = await originalFetch(input, init);
    const responseForRecording = response.clone();
    const body = await responseForRecording.text();

    options.onResponse(
      {
        requestId,
        status: response.status,
        headers: headersToRecord(response.headers),
        body,
        durationMs: options.clock.elapsed() - startedAt,
      },
      options.clock.elapsed(),
    );

    return response;
  };

  return () => {
    window.fetch = originalFetch;
  };
}
