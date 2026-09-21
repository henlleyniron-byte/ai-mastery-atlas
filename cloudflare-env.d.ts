/**
 * Compile-time fallback for the Cloudflare bindings injected by the managed
 * Sites runtime. It has no runtime effect and deliberately declares only the
 * surface this public, database-free Atlas starter references.
 */
interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  prepare(query: string): unknown;
}

declare module "cloudflare:workers" {
  export const env: { DB?: D1Database };
}
