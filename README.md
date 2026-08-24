# สมุดบัญชี — เว็บแอปรายรับรายจ่าย

เว็บแอปเต็มรูปแบบ พร้อมระบบล็อกอิน + ฐานข้อมูล ให้คนอื่นสมัครและใช้งานได้จริง แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง

**สแตก:** Next.js 14 (App Router) + Supabase (ฐานข้อมูล + ระบบล็อกอิน) + Tailwind CSS
**โฮสต์:** Vercel (ฟรี)

---

## ภาพรวมขั้นตอนทั้งหมด

1. ตั้งฐานข้อมูล + ระบบล็อกอินบน Supabase (ฟรี)
2. รันโปรเจกต์นี้บนเครื่องตัวเอง เพื่อทดสอบ
3. อัปโหลดโค้ดขึ้น GitHub
4. เชื่อม GitHub เข้ากับ Vercel เพื่อ deploy
5. ซื้อโดเมน แล้วชี้มาที่ Vercel

---

## ขั้นตอนที่ 1 — ตั้งค่า Supabase (ฐานข้อมูล + ล็อกอิน)

1. ไปที่ [supabase.com](https://supabase.com) แล้วสมัครบัญชี (ใช้ GitHub login ได้)
2. กด **New Project** ตั้งชื่อโปรเจกต์ เลือก region ใกล้ไทยที่สุด (Singapore) ตั้งรหัสผ่านฐานข้อมูล แล้วรอสักครู่ให้โปรเจกต์สร้างเสร็จ
3. ไปที่เมนู **SQL Editor** (แถบซ้าย) กด **New query**
4. เปิดไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ คัดลอกทั้งหมดไปวาง แล้วกด **Run**
   - ขั้นตอนนี้จะสร้างตาราง `transactions` และตั้งกฎความปลอดภัย (Row Level Security) ให้แต่ละคนเห็นแค่ข้อมูลของตัวเอง
5. ไปที่ **Project Settings > API** คัดลอก 2 ค่านี้เก็บไว้:
   - `Project URL`
   - `anon public` key
6. (แนะนำ) ไปที่ **Authentication > Providers > Email** เปิด "Confirm email" ถ้าอยากให้ผู้ใช้ยืนยันอีเมลก่อนเข้าระบบ

---

## ขั้นตอนที่ 2 — รันทดสอบบนเครื่องตัวเอง

ต้องมี [Node.js](https://nodejs.org) (เวอร์ชัน 18 ขึ้นไป) ติดตั้งก่อน

```bash
cd ledger-webapp
npm install
cp .env.local.example .env.local
```

เปิดไฟล์ `.env.local` แล้วใส่ค่า `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ที่คัดลอกมาจากขั้นตอนที่ 1

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` — ควรเจอหน้าสมัครสมาชิก/เข้าสู่ระบบ ลองสมัครและเพิ่มรายการดูว่าทำงานถูกต้อง

---

## ขั้นตอนที่ 3 — อัปโหลดโค้ดขึ้น GitHub

1. สร้างบัญชี [github.com](https://github.com) ถ้ายังไม่มี
2. สร้าง repository ใหม่ (New repository) ตั้งชื่อ เช่น `ledger-webapp` — เลือก **Private** ถ้าไม่อยากให้คนอื่นเห็นโค้ด
3. ในเครื่อง รันคำสั่ง:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ledger-webapp.git
git push -u origin main
```

> ไฟล์ `.env.local` จะไม่ถูกอัปโหลด (ถูกกันไว้ใน `.gitignore` แล้ว) เพื่อความปลอดภัย

---

## ขั้นตอนที่ 4 — Deploy บน Vercel

1. ไปที่ [vercel.com](https://vercel.com) สมัคร/ล็อกอินด้วยบัญชี GitHub เดียวกัน
2. กด **Add New... > Project** เลือก repository `ledger-webapp` ที่เพิ่งอัปโหลด
3. ตรงหัวข้อ **Environment Variables** ใส่ 2 ค่าเดียวกับ `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. กด **Deploy** รอ 1-2 นาที
5. เสร็จแล้วจะได้ URL ทดลองใช้ฟรีทันที เช่น `ledger-webapp.vercel.app`

ทดสอบ URL นี้ สมัครสมาชิกและเพิ่มรายการดูอีกครั้งเพื่อยืนยันว่าใช้งานได้จริงบนโลกออนไลน์

---

## ขั้นตอนที่ 5 — ต่อโดเมนของตัวเอง

### 5.1 ซื้อโดเมน
ซื้อจากผู้ให้บริการที่สะดวก เช่น:
- [Namecheap](https://namecheap.com) — ราคาย่อมเยา นิยมมาก
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — ไม่มีค่าธรรมเนียมส่วนเกิน
- ผู้ให้บริการไทย เช่น Zonedomain, Netway

เลือกชื่อโดเมน เช่น `mymoney.com`, `บัญชีของฉัน.app` ฯลฯ

### 5.2 เพิ่มโดเมนใน Vercel
1. ในโปรเจกต์บน Vercel ไปที่แท็บ **Settings > Domains**
2. พิมพ์ชื่อโดเมนที่ซื้อมา แล้วกด **Add**
3. Vercel จะแสดงค่า DNS ที่ต้องตั้ง (โดยทั่วไปมี 2 แบบ ให้เลือกอย่างใดอย่างหนึ่งตามที่ Vercel แนะนำ):
   - **A record** ชี้ไปที่ IP ของ Vercel (เช่น `76.76.21.21`)
   - หรือ **CNAME record** ชี้ไปที่ `cname.vercel-dns.com`

### 5.3 ตั้งค่า DNS ที่ผู้ให้บริการโดเมน
1. เข้าไปที่หน้าจัดการโดเมน (DNS management) ของผู้ให้บริการที่ซื้อมา
2. เพิ่ม record ตามที่ Vercel บอกไว้ในขั้นตอน 5.2 เป๊ะๆ
3. รอ DNS อัปเดต (ปกติไม่กี่นาที บางครั้งนานสุดถึง 24 ชม.)
4. กลับไปที่หน้า Domains ใน Vercel — เมื่อระบบตรวจสอบผ่านจะขึ้นสถานะ ✅ และออกใบรับรอง HTTPS ให้อัตโนมัติ

เท่านี้แอปก็เข้าถึงได้ผ่านโดเมนของคุณเองแล้ว เช่น `https://mymoney.com`

---

## โครงสร้างโปรเจกต์

```
ledger-webapp/
├── app/
│   ├── layout.tsx          # โครงหน้าเว็บ + ฟอนต์ไทย
│   ├── page.tsx             # หน้าแรก (ตรวจสอบล็อกอิน แล้วแสดงสมุดบัญชี)
│   ├── globals.css
│   └── login/page.tsx       # หน้าเข้าสู่ระบบ/สมัครสมาชิก
├── components/
│   └── Ledger.tsx           # ส่วนแสดงผลหลักของแอป (ต่อกับฐานข้อมูล)
├── lib/supabase/
│   ├── client.ts             # Supabase client ฝั่งเบราว์เซอร์
│   ├── server.ts             # Supabase client ฝั่งเซิร์ฟเวอร์
│   └── middleware.ts         # ตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บ
├── middleware.ts
├── supabase/schema.sql       # คำสั่งสร้างตารางฐานข้อมูล + กฎความปลอดภัย
└── .env.local.example
```

## ความปลอดภัยของข้อมูล

ระบบใช้ **Row Level Security (RLS)** ของ Supabase ทำให้แต่ละบัญชีผู้ใช้เห็นและแก้ไขได้เฉพาะรายการของตัวเองเท่านั้น แม้จะยิง query ตรงก็ไม่สามารถเห็นข้อมูลของคนอื่นได้ เพราะกฎถูกบังคับใช้ในระดับฐานข้อมูล ไม่ใช่แค่ในโค้ดหน้าเว็บ

## หมายเหตุ

Vercel และ Supabase มีแผนฟรีที่เพียงพอสำหรับแอปขนาดเล็ก-กลาง หากมีผู้ใช้จำนวนมากขึ้นค่อยพิจารณาอัปเกรดแผนทีหลังได้
