import type { NetworkRequestPayload, NetworkResponsePayload } from "@henriquecosta/react-debugmachine-shared";
import type { RecordingClock } from "./clock";

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

function parseResponseHeaders(raw: string): Record<string, string> {
  const record: Record<string, string> = {};
  for (const line of raw.trim().split(/\r?\n/)) {
    if (!line) continue;
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    record[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
  }
  return record;
}

/** `responseText` throws for binary `responseType`s (e.g. "arraybuffer",
 * "blob") — only read it back when the response is actually text-shaped. */
function safeResponseText(xhr: XMLHttpRequest): string | null {
  if (xhr.responseType !== "" && xhr.responseType !== "text") return null;
  try {
    return xhr.responseText;
  } catch {
    return null;
  }
}

let nextRequestId = 1;

export interface NetworkHookOptions {
  clock: RecordingClock;
  onRequest: (payload: NetworkRequestPayload, timestamp: number) => void;
  onResponse: (payload: NetworkResponsePayload, timestamp: number) => void;
}

/** Wraps `fetch` to capture request/response pairs with timing. */
export function installFetchHook(options: NetworkHookOptions): () => void {
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

/** Wraps `XMLHttpRequest` to capture request/response pairs with timing,
 * covering libraries that don't go through `fetch`. Request metadata is
 * stashed per-instance (via `open`/`setRequestHeader`) and the response is
 * captured once the request finishes, at `loadend`. */
export function installXhrHook(options: NetworkHookOptions): () => void {
  const OriginalXHR = window.XMLHttpRequest;
  const originalOpen = OriginalXHR.prototype.open;
  const originalSend = OriginalXHR.prototype.send;
  const originalSetRequestHeader = OriginalXHR.prototype.setRequestHeader;

  const requestHeadersByXhr = new WeakMap<XMLHttpRequest, Record<string, string>>();
  const requestInfoByXhr = new WeakMap<XMLHttpRequest, { method: string; url: string }>();

  OriginalXHR.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    requestInfoByXhr.set(this, { method, url: String(url) });
    return (originalOpen as (...args: unknown[]) => void).apply(this, [method, url, ...rest]);
  };

  OriginalXHR.prototype.setRequestHeader = function (
    this: XMLHttpRequest,
    name: string,
    value: string,
  ) {
    const headers = requestHeadersByXhr.get(this) ?? {};
    headers[name] = value;
    requestHeadersByXhr.set(this, headers);
    return originalSetRequestHeader.call(this, name, value);
  };

  OriginalXHR.prototype.send = function (
    this: XMLHttpRequest,
    body?: Document | XMLHttpRequestBodyInit | null,
  ) {
    const requestId = `req${nextRequestId++}`;
    const info = requestInfoByXhr.get(this);
    const startedAt = options.clock.elapsed();

    options.onRequest(
      {
        requestId,
        url: info?.url ?? "",
        method: info?.method ?? "GET",
        headers: requestHeadersByXhr.get(this) ?? {},
        body: body != null ? String(body) : null,
      },
      startedAt,
    );

    this.addEventListener("loadend", () => {
      options.onResponse(
        {
          requestId,
          status: this.status,
          headers: parseResponseHeaders(this.getAllResponseHeaders()),
          body: safeResponseText(this),
          durationMs: options.clock.elapsed() - startedAt,
        },
        options.clock.elapsed(),
      );
    });

    return originalSend.call(this, body ?? null);
  };

  return () => {
    OriginalXHR.prototype.open = originalOpen;
    OriginalXHR.prototype.setRequestHeader = originalSetRequestHeader;
    OriginalXHR.prototype.send = originalSend;
  };
}

/** Composes the `fetch` and `XMLHttpRequest` hooks into one install/restore pair. */
export function installNetworkHook(options: NetworkHookOptions): () => void {
  const restoreFetch = installFetchHook(options);
  const restoreXhr = installXhrHook(options);

  return () => {
    restoreFetch();
    restoreXhr();
  };
}
