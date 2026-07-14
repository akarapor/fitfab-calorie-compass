import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  sex: text("sex").notNull(),
  age: integer("age").notNull(),
  weight: real("weight").notNull(),
  height: real("height").notNull(),
  activity: real("activity").notNull(),
  goal: text("goal").notNull(),
  bmr: integer("bmr").notNull(),
  tdee: integer("tdee").notNull(),
  calorieTarget: integer("calorie_target").notNull(),
  consentedAt: text("consented_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
