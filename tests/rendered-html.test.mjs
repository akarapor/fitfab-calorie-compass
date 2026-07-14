import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships the complete Thai BMR/TDEE calculator", async () => {
  const [page, layout, css, schema, route, migration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_worried_vulture.sql", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /lang="th"/);
  assert.match(layout, /og\.png/);
  assert.match(page, /Mifflin/);
  assert.match(page, /คำนวณค่าของฉัน/);
  assert.match(page, /Strength Training 2–4 วัน/);
  assert.match(page, /consent/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(schema, /sqliteTable\("leads"/);
  assert.match(route, /sex === "male" \? 5 : -161/);
  assert.match(route, /goal === "lose" \? \.85/);
  assert.match(migration, /CREATE TABLE `leads`/);
  assert.doesNotMatch(page + layout, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("Mifflin–St Jeor and goal adjustment produce the expected reference result", () => {
  const weight = 70, height = 170, age = 35, activity = 1.55;
  const bmr = Math.round((10 * weight + 6.25 * height - 5 * age + 5) / 10) * 10;
  const tdee = Math.round((bmr * activity) / 10) * 10;
  const target = Math.round((tdee * .85) / 10) * 10;
  assert.deepEqual({ bmr, tdee, target }, { bmr: 1590, tdee: 2460, target: 2090 });
});
