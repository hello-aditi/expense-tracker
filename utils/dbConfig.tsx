import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'

const sql = neon('postgresql://neondb_owner:npg_mla4szne5qdJ@ep-twilight-moon-a8q7mgzc-pooler.eastus2.azure.neon.tech/Expense-Tracker?sslmode=require');
export const db = drizzle(sql, {schema});