import { Config, defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.tsx",
  out: "./drizzle",

  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_mla4szne5qdJ@ep-twilight-moon-a8q7mgzc-pooler.eastus2.azure.neon.tech/Expense-Tracker?sslmode=require',
  }
}) satisfies Config;


