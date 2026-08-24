"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : error.message
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setNotice("สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วเข้าสู่ระบบ");
        setMode("signin");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-ledger-green flex items-center justify-center mb-3 shadow-md">
            <Wallet size={24} color="#F5EFE0" />
          </div>
          <h1 className="font-serifThai text-2xl font-bold text-ink">
            สมุดบัญชี
          </h1>
          <p className="text-muted text-sm mt-1">รายรับ–รายจ่ายส่วนตัว</p>
        </div>

        <div className="bg-card border border-ledger-line rounded-2xl p-6 shadow-sm">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-ledger-green text-[#F5EFE0]"
                  : "text-muted border border-ledger-line"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-ledger-green text-[#F5EFE0]"
                  : "text-muted border border-ledger-line"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted font-medium">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-ledger-line bg-white outline-none text-sm focus:ring-2 focus:ring-ledger-green/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium">รหัสผ่าน</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-ledger-line bg-white outline-none text-sm focus:ring-2 focus:ring-ledger-green/30"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>

            {error && (
              <div className="text-sm text-ledger-red bg-ledger-red/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {notice && (
              <div className="text-sm text-ledger-blue bg-ledger-blue/10 rounded-lg px-3 py-2">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-ledger-green text-[#F5EFE0] font-semibold text-sm disabled:opacity-60"
            >
              {loading
                ? "กำลังดำเนินการ..."
                : mode === "signin"
                ? "เข้าสู่ระบบ"
                : "สมัครสมาชิก"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
