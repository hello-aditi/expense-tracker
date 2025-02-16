import { serial, pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core"; 

export const Budgets = pgTable('Budgets',{
    id: serial('id').primaryKey(), 
    name: varchar('name').notNull(),
    amount: integer('amount').notNull(),
    icon: varchar('icon'),
    createdBy: varchar('createdBy').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
});

export const Expenses = pgTable('Expenses',{
    id:serial('id').primaryKey(),
    name:varchar('name').notNull(),
    amount: integer('amount').notNull(),
    budgetId:integer('budgetId').references(()=>Budgets.id),
    createdBy: varchar('createdBy').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
});

export const Incomes = pgTable('Incomes', {
    id: serial('id').primaryKey(),
    source: varchar('source').notNull(), 
    amount: integer('amount').notNull(),
    createdBy: varchar('createdBy').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
});