import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../core/db/schema.js";
import { supabase } from "../db/supabase.client.js";
import fs from "fs";
import path from "path";

// Persistence of DB Mode choice
const CONFIG_FILE = path.resolve(process.cwd(), "db_mode_config.json");

let currentMode = "dev"; // default: 'dev' (SQLite) or 'prod' (Supabase)

// Try reading stored mode on startup
try {
  if (fs.existsSync(CONFIG_FILE)) {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    if (data.mode === "dev" || data.mode === "prod") {
      currentMode = data.mode;
    }
  }
} catch (err) {
  console.warn("[DB-SWITCH] ⚠️ Could not load stored DB mode, defaulting to 'dev'.", err.message);
}

// Dev SQLite instance
const DB_PATH = (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "");
export const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
export const devDb = drizzle(sqlite, { schema });

/**
 * Get current database mode ('dev' | 'prod')
 */
export function getDbMode() {
  return currentMode;
}

/**
 * Switch database mode
 */
export function setDbMode(mode) {
  if (mode !== "dev" && mode !== "prod") {
    throw new Error("Invalid DB mode. Accepted values: 'dev' or 'prod'");
  }
  currentMode = mode;
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ mode: currentMode, updatedAt: new Date().toISOString() }, null, 2));
  } catch (err) {
    console.error("[DB-SWITCH] ❌ Failed to persist DB mode config:", err.message);
  }
  console.log(`[DB-SWITCH] 🔄 Database mode switched to: [${currentMode.toUpperCase()}]`);
  return currentMode;
}

/**
 * Check connection health for both databases
 */
export async function checkDbHealth() {
  let sqliteOk = false;
  let sqliteOrdersCount = 0;
  try {
    const row = sqlite.prepare("SELECT count(*) as count FROM orders").get();
    sqliteOrdersCount = row?.count ?? 0;
    sqliteOk = true;
  } catch (err) {
    sqliteOk = false;
  }

  let supabaseOk = false;
  let supabaseMessage = "";
  try {
    const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
    if (!error) {
      supabaseOk = true;
      supabaseMessage = "Connected to Supabase PostgreSQL";
    } else {
      supabaseOk = false;
      supabaseMessage = error.message;
    }
  } catch (err) {
    supabaseOk = false;
    supabaseMessage = err.message;
  }

  return {
    activeMode: currentMode,
    sqlite: {
      connected: sqliteOk,
      dbPath: DB_PATH,
      ordersCount: sqliteOrdersCount,
    },
    supabase: {
      connected: supabaseOk,
      url: process.env.SUPABASE_URL || "Non configuré",
      statusText: supabaseMessage,
    }
  };
}
