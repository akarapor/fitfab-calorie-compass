"use client";

import { FormEvent, useMemo, useState } from "react";

type Sex = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

const activityLevels = [
  { value: "1.2", label: "น้อยมาก", detail: "นั่งทำงานเป็นหลัก แทบไม่ออกกำลัง" },
  { value: "1.375", label: "เบา", detail: "ออกกำลัง 1–3 วัน/สัปดาห์" },
  { value: "1.55", label: "ปานกลาง", detail: "ออกกำลัง 3–5 วัน/สัปดาห์" },
  { value: "1.725", label: "สูง", detail: "ออกกำลังหนัก 6–7 วัน/สัปดาห์" },
  { value: "1.9", label: "สูงมาก", detail: "งานใช้แรงร่วมกับซ้อมหนัก" },
];

const goalConfig: Record<Goal, { label: string; factor: number; verb: string }> = {
  lose: { label: "ลดไขมัน", factor: 0.85, verb: "ขาดดุลประมาณ 15%" },
  maintain: { label: "รักษาน้ำหนัก", factor: 1, verb: "ใกล้เคียง TDEE" },
  gain: { label: "เพิ่มกล้ามเนื้อ", factor: 1.1, verb: "เกินดุลประมาณ 10%" },
};

function roundToTen(value: number) {
  return Math.round(value / 10) * 10;
}

export default function Home() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(35);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<Goal>("lose");
  const [calculated, setCalculated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  const result = useMemo(() => {
    const base = 10 * weight + 6.25 * height - 5 * age;
    const bmr = roundToTen(base + (sex === "male" ? 5 : -161));
    const tdee = roundToTen(bmr * Number(activity));
    const target = roundToTen(tdee * goalConfig[goal].factor);
    const proteinLow = Math.round(weight * (goal === "lose" ? 1.8 : 1.6));
    const proteinHigh = Math.round(weight * 2.2);
    return { bmr, tdee, target, proteinLow, proteinHigh };
  }, [activity, age, goal, height, sex, weight]);

  function calculate(event: FormEvent) {
    event.preventDefault();
    setCalculated(true);
    setSaveState("idle");
    window.setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function saveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setSaveState("idle");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          contact: form.get("contact"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
          sex,
          age,
          weight,
          height,
          activity: Number(activity),
          goal,
        }),
      });
      if (!response.ok) throw new Error("save failed");
      setSaveState("saved");
      event.currentTarget.reset();
    } catch {
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FitFab Calorie Compass หน้าแรก">
          <img className="brand-logo" src="/fitfab-logo.jpg" alt="" />
          <span className="brand-copy"><b>FITFAB</b><small>CALORIE COMPASS</small></span>
        </a>
        <span className="evidence-badge"><i /> Evidence-based calculator</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">รู้ตัวเลขของคุณ แล้วกินให้ตรงเป้า</p>
          <h1>แคลอรีที่ใช่<br /><em>ไม่ต้องเดา</em></h1>
          <p className="hero-description">
            คำนวณ BMR และ TDEE รายบุคคลในไม่ถึง 1 นาที พร้อมเป้าพลังงานที่นำไปจัดอาหารและออกกำลังกายได้จริง
          </p>
          <div className="trust-row">
            <span><b>01</b> Mifflin–St Jeor</span>
            <span><b>02</b> ปรับตาม Lifestyle</span>
            <span><b>03</b> คำแนะนำเฉพาะเป้าหมาย</span>
          </div>
        </div>
        <figure className="hero-logo-card">
          <img src="/fitfab-logo.jpg" alt="FitFab — Start today, Live better" />
          <figcaption><span>POWERED BY</span><strong>FITFAB</strong></figcaption>
        </figure>
      </section>

      <section className="calculator-shell" aria-label="เครื่องคำนวณ BMR และ TDEE">
        <form className="calculator-form" onSubmit={calculate}>
          <div className="section-heading">
            <span>01</span>
            <div><h2>ข้อมูลร่างกาย</h2><p>ใช้ข้อมูลปัจจุบันเพื่อความแม่นยำ</p></div>
          </div>

          <fieldset>
            <legend>เพศกำเนิด <small>ใช้เฉพาะในสมการคำนวณ</small></legend>
            <div className="segmented">
              <label><input type="radio" name="sex" checked={sex === "male"} onChange={() => setSex("male")} /><span>ชาย</span></label>
              <label><input type="radio" name="sex" checked={sex === "female"} onChange={() => setSex("female")} /><span>หญิง</span></label>
            </div>
          </fieldset>

          <div className="measure-grid">
            <label>อายุ <span><input type="number" min="18" max="80" value={age} onChange={(e) => setAge(Number(e.target.value))} required /> ปี</span></label>
            <label>น้ำหนัก <span><input type="number" min="35" max="250" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} required /> kg</span></label>
            <label>ส่วนสูง <span><input type="number" min="130" max="230" value={height} onChange={(e) => setHeight(Number(e.target.value))} required /> cm</span></label>
          </div>

          <div className="section-heading compact">
            <span>02</span>
            <div><h2>Lifestyle</h2><p>เลือกจากกิจกรรมจริงทั้งวัน ไม่ใช่เฉพาะเวลาซ้อม</p></div>
          </div>

          <label className="select-label">ระดับกิจกรรม
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              {activityLevels.map((item) => <option key={item.value} value={item.value}>{item.label} — {item.detail}</option>)}
            </select>
          </label>

          <fieldset>
            <legend>เป้าหมาย</legend>
            <div className="goal-grid">
              {(Object.keys(goalConfig) as Goal[]).map((item) => (
                <label key={item}><input type="radio" name="goal" checked={goal === item} onChange={() => setGoal(item)} /><span>{goalConfig[item].label}</span></label>
              ))}
            </div>
          </fieldset>

          <button className="primary-button" type="submit">คำนวณค่าของฉัน <span>→</span></button>
          <p className="formula-note">สูตร Mifflin–St Jeor สำหรับผู้ใหญ่อายุ 18–80 ปี</p>
        </form>

        <aside className={`result-panel ${calculated ? "is-ready" : ""}`} id="result" aria-live="polite">
          {!calculated ? (
            <div className="result-empty">
              <div className="dial"><span>?</span></div>
              <p>กรอกข้อมูลด้านซ้าย<br />เพื่อดูค่าพลังงานของคุณ</p>
              <small>BMR • TDEE • CALORIE TARGET</small>
            </div>
          ) : (
            <div className="result-content">
              <p className="result-kicker">ผลคำนวณของคุณ</p>
              <div className="target-calories">
                <span>เป้าพลังงานต่อวัน</span>
                <strong>{result.target.toLocaleString("th-TH")}</strong>
                <small>kcal / day</small>
                <p>{goalConfig[goal].label} · {goalConfig[goal].verb}</p>
              </div>
              <div className="energy-cards">
                <article><span>BMR</span><strong>{result.bmr.toLocaleString("th-TH")}</strong><small>พลังงานขั้นต่ำขณะพัก</small></article>
                <article><span>TDEE</span><strong>{result.tdee.toLocaleString("th-TH")}</strong><small>พลังงานที่ใช้ทั้งวัน</small></article>
              </div>
              <div className="recommendations">
                <h3>แผนเริ่มต้นที่แนะนำ</h3>
                <ul>
                  <li><span>01</span><p><b>โปรตีน {result.proteinLow}–{result.proteinHigh} g/วัน</b> แบ่ง 3–4 มื้อ เพื่อรักษาหรือเพิ่มมวลกล้ามเนื้อ</p></li>
                  <li><span>02</span><p><b>Strength Training 2–4 วัน/สัปดาห์</b> เน้น Progressive Overload และท่าหลักครบทุก Movement Pattern</p></li>
                  <li><span>03</span><p><b>ติดตามค่าเฉลี่ยน้ำหนัก 14 วัน</b> ถ้าแนวโน้มไม่ตรงเป้า ค่อยปรับครั้งละ 100–150 kcal</p></li>
                </ul>
              </div>

              <form className="lead-form" onSubmit={saveLead}>
                <h3>รับผลคำนวณไว้ใช้อ้างอิง</h3>
                <p>ฝากข้อมูลติดต่อ แล้วผลของคุณจะถูกบันทึกอย่างปลอดภัย</p>
                <div className="lead-fields">
                  <label>ชื่อ<input name="name" placeholder="ชื่อของคุณ" minLength={2} maxLength={80} required /></label>
                  <label>LINE / โทร / Email<input name="contact" placeholder="ช่องทางที่สะดวก" minLength={3} maxLength={120} required /></label>
                </div>
                <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <label className="consent"><input type="checkbox" name="consent" required /><span>ยินยอมให้เก็บข้อมูลและติดต่อกลับเกี่ยวกับคำแนะนำสุขภาพ โดยสามารถขอลบข้อมูลได้ภายหลัง</span></label>
                <button type="submit" disabled={saving}>{saving ? "กำลังบันทึก…" : "บันทึกผลของฉัน"}</button>
                {saveState === "saved" && <p className="save-message success">บันทึกเรียบร้อย ข้อมูลของคุณปลอดภัยแล้ว</p>}
                {saveState === "error" && <p className="save-message error">บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง</p>}
              </form>
            </div>
          )}
        </aside>
      </section>

      <section className="explain-section">
        <div><p className="eyebrow">เข้าใจตัวเลขใน 30 วินาที</p><h2>BMR คือฐาน<br />TDEE คือชีวิตจริง</h2></div>
        <div className="explain-grid">
          <article><span>BMR</span><h3>Basal Metabolic Rate</h3><p>พลังงานที่ร่างกายต้องใช้เพื่อคงการทำงานพื้นฐาน เช่น หายใจ ไหลเวียนเลือด และควบคุมอุณหภูมิ ไม่ใช่เป้าพลังงานสำหรับกินระยะยาว</p></article>
          <article><span>TDEE</span><h3>Total Daily Energy Expenditure</h3><p>BMR รวมกิจกรรม การออกกำลังกาย และการย่อยอาหาร เป็นจุดเริ่มต้นที่เหมาะกว่าสำหรับวางแผน Calorie Intake</p></article>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><img src="/fitfab-logo.jpg" alt="FitFab" /><p>FITFAB × CALORIE COMPASS <span>© 2026</span></p></div>
        <small>ค่าที่ได้เป็นการประมาณสำหรับบุคคลทั่วไป ไม่ใช้วินิจฉัยหรือรักษาโรค ผู้ตั้งครรภ์ ให้นมบุตร อายุต่ำกว่า 18 ปี มีโรคประจำตัว หรือมีประวัติ Eating Disorder ควรปรึกษาแพทย์หรือนักกำหนดอาหารก่อนปรับพลังงาน</small>
      </footer>
    </main>
  );
}
