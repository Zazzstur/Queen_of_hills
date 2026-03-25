import { createClient } from "@supabase/supabase-js";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function loadDotEnv() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "..");
  const envPath = path.join(repoRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!key) continue;
    if (process.env[key] === undefined || process.env[key] === "")
      process.env[key] = value;
  }
}

function asOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value);
  return s.length ? s : undefined;
}

function asNumber(value: unknown, fallback: number) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.length) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

async function fetchBatch<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  offset: number,
  limit: number,
) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []) as T[];
}

async function main() {
  loadDotEnv();

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    "";
  const convexUrl =
    process.env.CONVEX_URL ??
    process.env.CONVEX_DEPLOYMENT_URL ??
    process.env.VITE_CONVEX_URL ??
    "";

  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL (or VITE_SUPABASE_URL)");
  if (!supabaseKey)
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY)",
    );
  if (!convexUrl)
    throw new Error(
      "Missing CONVEX_URL (or CONVEX_DEPLOYMENT_URL/VITE_CONVEX_URL)",
    );

  const batchSize = asNumber(process.env.BATCH_SIZE, 100);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const convex = new ConvexHttpClient(convexUrl);

  const staysMap = new Map<string, string>();
  const roomsMap = new Map<string, string>();
  const routesMap = new Map<string, string>();
  const stopsMap = new Map<string, string>();

  let inserted = 0;
  let failed = 0;

  type StayRow = {
    id: string;
    created_at: string;
    name: string;
    description: string | null;
    type: "Hotel" | "Homestay" | "Resort" | "Heritage Stay";
    location: string;
    amenities: string[] | null;
    thumbnail_url: string | null;
  };

  type RoomRow = {
    id: string;
    created_at: string;
    stay_id: string;
    name: string;
    price: string | number;
    capacity: number | null;
    description: string | null;
  };

  type RoomImageRow = {
    id: string;
    created_at: string;
    room_id: string;
    url: string;
  };

  type RouteRow = {
    id: string;
    created_at: string;
    origin: string;
    destination: string;
    basePrice: string | number;
    capacity: string | null;
    description: string | null;
    coverImage: string | null;
  };

  type StopRow = {
    id: string;
    created_at: string;
    route_id: string;
    name: string;
    detourPrice: string | number | null;
    description: string | null;
  };

  type StopImageRow = {
    id: string;
    created_at: string;
    stop_id: string;
    url: string;
  };

  async function migrateStays() {
    let offset = 0;
    while (true) {
      const batch = await fetchBatch<StayRow>(supabase, "stays", offset, batchSize);
      if (!batch.length) break;
      for (const row of batch) {
        try {
          const id = (await convex.mutation(anyApi.migrations.upsertStay, {
            sId: row.id,
            created_at: row.created_at,
            name: row.name,
            description: asOptionalString(row.description),
            type: row.type,
            location: row.location,
            amenities: row.amenities ?? [],
            thumbnail_url: asOptionalString(row.thumbnail_url),
          })) as string;
          staysMap.set(row.id, id);
          inserted += 1;
        } catch (err) {
          failed += 1;
          console.error("Failed to upsert stay", row.id, err);
        }
      }
      offset += batch.length;
      console.log(`stays: processed ${offset}`);
    }
  }

  async function migrateRooms() {
    let offset = 0;
    while (true) {
      const batch = await fetchBatch<RoomRow>(supabase, "rooms", offset, batchSize);
      if (!batch.length) break;
      for (const row of batch) {
        const stayId = staysMap.get(row.stay_id);
        if (!stayId) {
          failed += 1;
          console.error("Missing stay mapping for room", row.id, row.stay_id);
          continue;
        }
        try {
          const id = (await convex.mutation(anyApi.migrations.upsertRoom, {
            sId: row.id,
            created_at: row.created_at,
            stay_id: stayId as any,
            s_stay_id: row.stay_id,
            name: row.name,
            price: asNumber(row.price, 0),
            capacity: asNumber(row.capacity, 2),
            description: asOptionalString(row.description),
          })) as string;
          roomsMap.set(row.id, id);
          inserted += 1;
        } catch (err) {
          failed += 1;
          console.error("Failed to upsert room", row.id, err);
        }
      }
      offset += batch.length;
      console.log(`rooms: processed ${offset}`);
    }
  }

  async function migrateRoomImages() {
    let offset = 0;
    while (true) {
      const batch = await fetchBatch<RoomImageRow>(
        supabase,
        "room_images",
        offset,
        batchSize,
      );
      if (!batch.length) break;
      for (const row of batch) {
        const roomId = roomsMap.get(row.room_id);
        if (!roomId) {
          failed += 1;
          console.error("Missing room mapping for room_image", row.id, row.room_id);
          continue;
        }
        try {
          await convex.mutation(anyApi.migrations.upsertRoomImage, {
            sId: row.id,
            created_at: row.created_at,
            room_id: roomId as any,
            s_room_id: row.room_id,
            url: row.url,
          });
          inserted += 1;
        } catch (err) {
          failed += 1;
          console.error("Failed to upsert room_image", row.id, err);
        }
      }
      offset += batch.length;
      console.log(`room_images: processed ${offset}`);
    }
  }

  async function migrateRoutes() {
    let offset = 0;
    while (true) {
      const batch = await fetchBatch<RouteRow>(supabase, "routes", offset, batchSize);
      if (!batch.length) break;
      for (const row of batch) {
        try {
          const id = (await convex.mutation(anyApi.migrations.upsertRoute, {
            sId: row.id,
            created_at: row.created_at,
            origin: row.origin,
            destination: row.destination,
            basePrice: asNumber(row.basePrice, 0),
            capacity: asOptionalString(row.capacity),
            description: asOptionalString(row.description),
            coverImage: asOptionalString(row.coverImage),
          })) as string;
          routesMap.set(row.id, id);
          inserted += 1;
        } catch (err) {
          failed += 1;
          console.error("Failed to upsert route", row.id, err);
        }
      }
      offset += batch.length;
      console.log(`routes: processed ${offset}`);
    }
  }

  async function migrateStops() {
    let offset = 0;
    while (true) {
      const batch = await fetchBatch<StopRow>(supabase, "stops", offset, batchSize);
      if (!batch.length) break;
      for (const row of batch) {
        const routeId = routesMap.get(row.route_id);
        if (!routeId) {
          failed += 1;
          console.error("Missing route mapping for stop", row.id, row.route_id);
          continue;
        }
        try {
          const id = (await convex.mutation(anyApi.migrations.upsertStop, {
            sId: row.id,
            created_at: row.created_at,
            route_id: routeId as any,
            s_route_id: row.route_id,
            name: row.name,
            detourPrice: asNumber(row.detourPrice, 0),
            description: asOptionalString(row.description),
          })) as string;
          stopsMap.set(row.id, id);
          inserted += 1;
        } catch (err) {
          failed += 1;
          console.error("Failed to upsert stop", row.id, err);
        }
      }
      offset += batch.length;
      console.log(`stops: processed ${offset}`);
    }
  }

  async function migrateStopImages() {
    let offset = 0;
    while (true) {
      const batch = await fetchBatch<StopImageRow>(
        supabase,
        "stop_images",
        offset,
        batchSize,
      );
      if (!batch.length) break;
      for (const row of batch) {
        const stopId = stopsMap.get(row.stop_id);
        if (!stopId) {
          failed += 1;
          console.error("Missing stop mapping for stop_image", row.id, row.stop_id);
          continue;
        }
        try {
          await convex.mutation(anyApi.migrations.upsertStopImage, {
            sId: row.id,
            created_at: row.created_at,
            stop_id: stopId as any,
            s_stop_id: row.stop_id,
            url: row.url,
          });
          inserted += 1;
        } catch (err) {
          failed += 1;
          console.error("Failed to upsert stop_image", row.id, err);
        }
      }
      offset += batch.length;
      console.log(`stop_images: processed ${offset}`);
    }
  }

  await migrateStays();
  await migrateRooms();
  await migrateRoomImages();
  await migrateRoutes();
  await migrateStops();
  await migrateStopImages();

  console.log({ inserted, failed });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
