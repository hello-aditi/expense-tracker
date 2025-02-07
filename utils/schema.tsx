import { serial, pgTable, varchar, integer } from "drizzle-orm/pg-core"; 

export const Budgets = pgTable('Budgets',{
    id: serial('id').primaryKey(), 
    name: varchar('name').notNull(),
    amount: integer('amount').notNull(),
    icon: varchar('icon'),
    createdBy: varchar('createdBy').notNull()
});

export const Expenses = pgTable('Expenses',{
    id:serial('id').primaryKey(),
    name:varchar('name').notNull(),
    amount: integer('amount').notNull(),
    budgetId:integer('budgetId').references(()=>Budgets.id),
    createdBy: varchar('createdBy').notNull()
})