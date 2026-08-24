"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, X, Trash2, Utensils, Car, Home, ShoppingBag, Film,
  HeartPulse, GraduationCap, MoreHorizontal, Briefcase, Gift,
  TrendingUp, Wallet, Landmark, LogOut,
} from "lucide-react";

type TxType = "income" | "expense";

type Transaction = {
  id: string;
  user_id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string | null;
  date: string; // YYYY-MM-DD
};

const EXPENSE_CATS = [
  { id: "food", label: "อาหาร", icon: Utensils },
  { id: "transport", label: "เดินทาง", icon: Car },
  { id: "home", label: "ที่อยู่อาศัย", icon: Home },
  { id: "shopping", label: "ช้อปปิ้ง", icon: ShoppingBag },
  { id: "fun", label: "บันเทิง", icon: Film },
  { id: "health", label: "สุขภาพ", icon: HeartPulse },
  { id: "edu", label: "การศึกษา", icon: GraduationCap },
  { id: "other_e", label: "อื่นๆ", icon: MoreHorizontal },
];

const INCOME_CATS = [
  { id: "salary", label: "เงินเดือน", icon: Briefcase },
  { id: "bonus", label: "โบนัส", icon: Gift },
  { id: "invest", label: "การลงทุน", icon: TrendingUp },
  { id: "biz", label: "ธุรกิจ", icon: Landmark },
  { id: "other_i", label: "อื่นๆ", icon: MoreHorizontal },
];

const ALL_CATS = [...EXPENSE_CATS, ...INCOME_CATS];

function catMeta(id: string) {
  return ALL_CATS.find((c) => c.id === id) || EXPENSE_CATS[EXPENSE_CATS.length - 1];
}

function formatBaht(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
}

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

export default function Ledger({ userEmail }: { userEmail: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formType, setFormType] = useState<TxType>("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCat, setFormCat] = useState(EXPENSE_CATS[0].id);
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState(todayStr());
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      setError("โหลดข้อมูลไม่สำเร็จ: " + error.message);
    } else {
      setTransactions(data as Transaction[]);
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  function openSheet(type: TxType) {
    setFormType(type);
    setFormCat(type === "expense" ? EXPENSE_CATS[0].id : INCOME_CATS[0].id);
    setFormAmount("");
    setFormNote("");
    setFormDate(todayStr());
    setError("");
    setSheetOpen(true);
  }

  async function handleSave() {
    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: formType,
      amount: amt,
      category: formCat,
      note: formNote.trim() || null,
      date: formDate,
    });

    if (error) {
      setError("บันทึกไม่สำเร็จ: " + error.message);
      return;
    }
    setSheetOpen(false);
    loadTransactions();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      setError("ลบไม่สำเร็จ: " + error.message);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const thisMonth = monthKey(todayStr());
  const monthTx = useMemo(
    () => transactions.filter((t) => monthKey(t.date) === thisMonth),
    [transactions, thisMonth]
  );

  const totals = useMemo(() => {
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthTx]);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filter !== "all") list = list.filter((t) => t.type === filter);
    return list;
  }, [transactions, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const activeCats = formType === "expense" ? EXPENSE_CATS : INCOME_CATS;

  return (
    <div className="bg-paper min-h-screen pb-24 relative">
      {/* Passbook cover */}
      <div className="bg-gradient-to-br from-ledger-green to-ledger-greenDark px-5 pt-7 pb-9 rounded-b-[28px] shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full border border-ledger-gold/25" />
        <div className="absolute top-2 right-2 w-24 h-24 rounded-full border border-ledger-gold/20" />

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border-[1.5px] border-ledger-gold flex items-center justify-center">
                <Wallet size={14} color="#B08D57" />
              </div>
              <span className="text-ledger-gold text-xs tracking-wider font-medium">
                สมุดบัญชีส่วนตัว
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[#F5EFE0]/60 text-xs hover:text-[#F5EFE0] transition"
            >
              <LogOut size={13} /> ออกจากระบบ
            </button>
          </div>

          <h1 className="font-serifThai text-[#F5EFE0] text-[22px] font-bold mb-1">
            รายรับ–รายจ่าย
          </h1>
          <p className="text-[#F5EFE0]/50 text-xs mb-4">{userEmail}</p>

          <div className="text-[#F5EFE0]/65 text-sm mb-0.5">ยอดคงเหลือเดือนนี้</div>
          <div
            className={`num font-serifThai text-[38px] font-bold mb-4 ${
              totals.balance < 0 ? "text-[#E8A0A0]" : "text-[#F5EFE0]"
            }`}
          >
            ฿{formatBaht(totals.balance)}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-[#F5EFE0]/[0.08] border border-ledger-gold/30 rounded-xl px-3.5 py-2.5">
              <div className="text-[#8FB5A5] text-[11px] mb-0.5">รายรับ</div>
              <div className="num text-[#F5EFE0] text-base font-semibold">
                +฿{formatBaht(totals.income)}
              </div>
            </div>
            <div className="flex-1 bg-[#F5EFE0]/[0.08] border border-ledger-gold/30 rounded-xl px-3.5 py-2.5">
              <div className="text-[#E0A6A6] text-[11px] mb-0.5">รายจ่าย</div>
              <div className="num text-[#F5EFE0] text-base font-semibold">
                -฿{formatBaht(totals.expense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-5 pt-4 pb-1">
        {[
          { id: "all", label: "ทั้งหมด" },
          { id: "income", label: "รายรับ" },
          { id: "expense", label: "รายจ่าย" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as "all" | TxType)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === f.id
                ? "bg-ledger-green border-ledger-green text-[#F5EFE0]"
                : "border-ledger-line text-[#5A5240]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mx-5 mt-3 text-sm text-ledger-red bg-ledger-red/10 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Ledger list */}
      <div className="px-5 py-3">
        {!loaded ? (
          <div className="text-center py-12 text-muted text-sm">กำลังโหลดข้อมูล...</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-14 px-4 border border-dashed border-ledger-line rounded-2xl mt-2 text-muted">
            <div className="text-[15px] font-medium mb-1 text-[#5A5240]">ยังไม่มีรายการ</div>
            <div className="text-[13px]">แตะปุ่ม + ด้านล่างเพื่อบันทึกรายการแรกของคุณ</div>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} className="mb-4">
              <div className="text-xs text-[#8A8168] font-semibold mb-1.5 pl-0.5">
                {formatThaiDate(date)}
              </div>
              <div className="bg-card rounded-2xl border border-ledger-line overflow-hidden">
                {items.map((t, i) => {
                  const meta = catMeta(t.category);
                  const Icon = meta.icon;
                  const isIncome = t.type === "income";
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3 px-3.5 py-3 hover:bg-ledger-green/5 transition ${
                        i === 0 ? "" : "border-t border-dashed border-ledger-line"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{
                          background: isIncome
                            ? "rgba(44,71,112,0.08)"
                            : "rgba(162,59,59,0.08)",
                        }}
                      >
                        <Icon size={17} color={isIncome ? "#2C4770" : "#A23B3B"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink">{meta.label}</div>
                        {t.note && (
                          <div className="text-[12.5px] text-muted mt-0.5">{t.note}</div>
                        )}
                      </div>
                      <div
                        className={`num text-[15px] font-semibold whitespace-nowrap ${
                          isIncome ? "text-ledger-blue" : "text-ledger-red"
                        }`}
                      >
                        {isIncome ? "+" : "-"}฿{formatBaht(t.amount)}
                      </div>
                      <button
                        onClick={() => handleDelete(t.id)}
                        aria-label="ลบรายการ"
                        className="text-[#C4BB9F] p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 right-5 flex flex-col gap-2.5">
        <button
          onClick={() => openSheet("income")}
          aria-label="เพิ่มรายรับ"
          className="w-12 h-12 rounded-full bg-ledger-blue text-[#F5EFE0] flex items-center justify-center shadow-lg text-xl hover:-translate-y-0.5 transition"
        >
          +
        </button>
        <button
          onClick={() => openSheet("expense")}
          aria-label="เพิ่มรายจ่าย"
          className="w-14 h-14 rounded-full bg-ledger-red text-[#F5EFE0] flex items-center justify-center shadow-lg hover:-translate-y-0.5 transition"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div
          className="backdrop-enter fixed inset-0 bg-black/45 flex items-end z-50"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="sheet-enter bg-card w-full rounded-t-3xl px-5 pt-5 pb-7 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serifThai text-lg font-bold text-ink">
                {formType === "income" ? "บันทึกรายรับ" : "บันทึกรายจ่าย"}
              </h2>
              <button onClick={() => setSheetOpen(false)} className="text-muted">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              {(["expense", "income"] as TxType[]).map((tp) => (
                <button
                  key={tp}
                  onClick={() => {
                    setFormType(tp);
                    setFormCat(tp === "expense" ? EXPENSE_CATS[0].id : INCOME_CATS[0].id);
                  }}
                  className={`flex-1 py-2 rounded-[10px] text-[13.5px] font-semibold border ${
                    formType === tp
                      ? tp === "income"
                        ? "bg-ledger-blue border-ledger-blue text-[#F5EFE0]"
                        : "bg-ledger-red border-ledger-red text-[#F5EFE0]"
                      : "border-ledger-line text-[#5A5240]"
                  }`}
                >
                  {tp === "income" ? "รายรับ" : "รายจ่าย"}
                </button>
              ))}
            </div>

            <label className="text-[12.5px] text-muted font-medium">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="num w-full text-[26px] font-bold border-0 border-b-2 border-ledger-line py-2 mt-1 mb-4 outline-none bg-transparent text-ink"
            />

            <label className="text-[12.5px] text-muted font-medium">หมวดหมู่</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {activeCats.map((c) => {
                const Icon = c.icon;
                const active = formCat === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setFormCat(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border active:scale-95 transition ${
                      active
                        ? "bg-ledger-green border-ledger-green text-[#F5EFE0]"
                        : "bg-white border-ledger-line text-[#5A5240]"
                    }`}
                  >
                    <Icon size={14} />
                    {c.label}
                  </button>
                );
              })}
            </div>

            <label className="text-[12.5px] text-muted font-medium">วันที่</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full text-sm border border-ledger-line rounded-[10px] px-3 py-2 mt-1.5 mb-3.5 outline-none text-ink bg-white"
            />

            <label className="text-[12.5px] text-muted font-medium">บันทึกช่วยจำ (ไม่บังคับ)</label>
            <input
              type="text"
              placeholder="เช่น ข้าวเที่ยงกับเพื่อน"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="w-full text-sm border border-ledger-line rounded-[10px] px-3 py-2 mt-1.5 mb-5 outline-none text-ink bg-white"
            />

            <button
              onClick={handleSave}
              disabled={!formAmount || parseFloat(formAmount) <= 0}
              className="w-full py-3 rounded-xl bg-ledger-green text-[#F5EFE0] text-[15px] font-semibold disabled:bg-ledger-line disabled:text-muted"
            >
              บันทึกรายการ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
