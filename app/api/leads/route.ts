import { ensureSchema, getDb } from "../../../db";
import { leads } from "../../../db/schema";

const activityValues = new Set([1.2, 1.375, 1.55, 1.725, 1.9]);
const goals = new Set(["lose", "maintain", "gain"]);

function roundToTen(value: number) {
  return Math.round(value / 10) * 10;
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as Record<string, unknown>;
    if (data.website) return Response.json({ ok: true }, { status: 201 });

    const name = typeof data.name === "string" ? data.name.trim() : "";
    const contact = typeof data.contact === "string" ? data.contact.trim() : "";
    const sex = data.sex === "male" || data.sex === "female" ? data.sex : "";
    const age = Number(data.age);
    const weight = Number(data.weight);
    const height = Number(data.height);
    const activity = Number(data.activity);
    const goal = typeof data.goal === "string" ? data.goal : "";

    const valid = data.consent === true && name.length >= 2 && name.length <= 80 &&
      contact.length >= 3 && contact.length <= 120 && sex &&
      Number.isFinite(age) && age >= 18 && age <= 80 &&
      Number.isFinite(weight) && weight >= 35 && weight <= 250 &&
      Number.isFinite(height) && height >= 130 && height <= 230 &&
      activityValues.has(activity) && goals.has(goal);

    if (!valid) return Response.json({ error: "ข้อมูลไม่ครบหรือไม่ถูกต้อง" }, { status: 400 });

    const base = 10 * weight + 6.25 * height - 5 * age;
    const bmr = roundToTen(base + (sex === "male" ? 5 : -161));
    const tdee = roundToTen(bmr * activity);
    const factor = goal === "lose" ? .85 : goal === "gain" ? 1.1 : 1;
    const calorieTarget = roundToTen(tdee * factor);

    await ensureSchema();
    const db = getDb();
    await db.insert(leads).values({ name, contact, sex, age, weight, height, activity, goal, bmr, tdee, calorieTarget });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "ไม่สามารถบันทึกข้อมูลได้" }, { status: 500 });
  }
}
