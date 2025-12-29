import { sql } from "drizzle-orm"
import { db } from "@/index"

await db.execute(sql`DROP SCHEMA public CASCADE`)
await db.execute(sql`CREATE SCHEMA public`)

console.log("Database reset complete")
process.exit(0)