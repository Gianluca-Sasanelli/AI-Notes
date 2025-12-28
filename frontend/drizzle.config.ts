import { defineConfig } from 'drizzle-kit';

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set");
}
console.log("POSTGRES_URL", process.env.POSTGRES_URL);
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  }
});