import { ConvexHttpClient } from "convex/browser";

let client;

export function getConvex() {
  if (client) return client;
  const url = import.meta.env.VITE_CONVEX_URL;
  if (!url) {
    throw new Error("Missing VITE_CONVEX_URL");
  }
  client = new ConvexHttpClient(url);
  return client;
}

