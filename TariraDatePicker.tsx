import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check, Clock, Sparkles } from "lucide-react";

interface TariraDatePickerProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  minDate?: string;
}

const MONTHS_PT = [
  { id: "01", name: "Janeiro", short: "Jan" },
  { id: "02", name: "Fevereiro", short: "Fev" },
  { id: "03", name: "Março", short: "Mar" },
  { id: "04", name: "Abril", short: "Abr" },
  { id: "05", name: "Maio", short: "Mai" },
  { id: "06", name: "Junho", short: "Jun" },
  { id: "07", name: "Julho", short: "Jul" },
  { id: "08", name: "Agosto", short: "Ago" },
  { id: "09", name: "Setembro", short: "Set" },
  { id: "10", name: "Outubro", short: "Out" },
  { id: "11", name: "Novembro", short: "Nov" },
  { id: "12", name: "Dezembro", short: "Dez" }
];

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function TariraDatePicker({
  value,
  onChange,
  label = "Data de Execução",
  minDate
}: TariraDatePickerProps) {
  // Parse initial value or default to current date
  const parseDate = (dStr?: string) => {
    if (!dStr) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: String(now.getMonth() + 1).padStart(2, "0"),
        day: String(now.getDate()).padStart(2, "0")
      };
    }
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10) || new Date().getFullYear(),
        month: parts[1].padStart(2, "0"),
        day: parts[2].padStart(2, "0")
      };
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: String(now.getMonth() + 1).padStart(2, "0"),
      day: String(now.getDate()).padStart(2, "0")
    };
  };

  const initial = parseDate(value);
  const [selectedYear, setSelectedYear] = useState<number>(initial.year);
  const [selectedMonth, setSelectedMonth] = useState<string>(initial.month);
  const [selectedDay, setSelectedDay] = useState<string>(initial.day);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [viewingMonth, setViewingMonth] = useState<number>(parseInt(initial.month, 10) - 1);
  const [viewingYear, setViewingYear] = useState<number>(initial.year);

  // Sync internal states when value prop changes
  useEffect(() => {
    const parsed = parseDate(value);
    setSelectedYear(parsed.year);
    setSelectedMonth(parsed.month);
    setSelectedDay(parsed.day);
    setViewingMonth(parseInt(parsed.month, 10) - 1);
    setViewingYear(parsed.year);
  }, [value]);

  // Calculate days in selected month and year
  const getDaysInMonth = (year: number, monthZeroIndexed: number) => {
    return new Date(year, monthZeroIndexed + 1, 0).getDate();
  };

  // Update full date string
  const updateDate = (y: number, m: string, d: string) => {
    const maxDays = getDaysInMonth(y, parseInt(m, 10) - 1);
    let safeDayNum = parseInt(d, 10);
    if (safeDayNum > maxDays) safeDayNum = maxDays;
    const safeDay = String(safeDayNum).padStart(2, "0");
    
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(safeDay);
    
    const formatted = `${y}-${m}-${safeDay}`;
    onChange(formatted);
  };

  // Format date in human-friendly Portuguese
  const formatFriendlyDate = (y: number, m: string, d: string) => {
    const dateObj = new Date(y, parseInt(m, 10) - 1, parseInt(d, 10));
    const dayOfWeek = WEEKDAYS_PT[dateObj.getDay()];
    const monthName = MONTHS_PT.find(mo => mo.id === m)?.name || m;
    return `${dayOfWeek}, ${parseInt(d, 10)} de ${monthName} de ${y}`;
  };

  // Quick preset dates
  const setPresetDate = (daysFromNow: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    updateDate(y, m, d);
  };

  // Generate calendar grid for viewingMonth and viewingYear
  const renderCalendarDays = () => {
    const firstDayIndex = new Date(viewingYear, viewingMonth, 1).getDay();
    const daysInCurrMonth = getDaysInMonth(viewingYear, viewingMonth);
    const cells = [];

    // Empty previous month padding
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`pad-${i}`} className="h-8"></div>);
    }

    const currentSelectedFormatted = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    for (let dayNum = 1; dayNum <= daysInCurrMonth; dayNum++) {
      const dayStr = String(dayNum).padStart(2, "0");
      const monthStr = String(viewingMonth + 1).padStart(2, "0");
      const cellDateStr = `${viewingYear}-${monthStr}-${dayStr}`;
      const isSelected = cellDateStr === currentSelectedFormatted;
      
      const isToday = (() => {
        const today = new Date();
        return (
          today.getFullYear() === viewingYear &&
          today.getMonth() === viewingMonth &&
          today.getDate() === dayNum
        );
      })();

      cells.push(
        <button
          key={`day-${dayNum}`}
          type="button"
          onClick={() => {
            updateDate(viewingYear, monthStr, dayStr);
          }}
          className={`h-8 w-8 mx-auto rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
            isSelected
              ? "bg-blue-400 text-white font-black shadow-lg shadow-blue-400/30 scale-105"
              : isToday
              ? "border border-blue-400/60 text-blue-300 hover:bg-blue-500/20"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          {dayNum}
        </button>
      );
    }

    return cells;
  };

  const yearsList = [2026, 2027, 2028];
  const daysCount = getDaysInMonth(selectedYear, parseInt(selectedMonth, 10) - 1);
  const daysArray = Array.from({ length: daysCount }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <div className="space-y-2">
      {/* Label and Quick Toggle */}
      <div className="flex justify-between items-center">
        <label className="text-[10px] tracking-wider text-blue-400 font-bold uppercase flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>{label} *</span>
        </label>
        <button
          type="button"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="text-[10px] text-blue-300 hover:text-blue-200 font-bold flex items-center gap-1 cursor-pointer underline underline-offset-2"
        >
          {isCalendarOpen ? "Ocultar Calendário" : "📅 Abrir Calendário Visual"}
        </button>
      </div>

      {/* QUICK PRESETS PILLS */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: "Hoje", days: 0 },
          { label: "Amanhã", days: 1 },
          { label: "+2 Dias", days: 2 },
          { label: "+1 Semana", days: 7 }
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setPresetDate(preset.days)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-400/40 text-[10px] font-bold text-slate-300 hover:text-blue-300 transition-all cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 3 INTERACTIVE CLICKABLE SELECTORS: DIA, MÊS, ANO */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-blue-500/30 shadow-inner">
        {/* 1. SELEÇÃO DO DIA */}
        <div>
          <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            1. Dia
          </label>
          <select
            value={selectedDay}
            onChange={(e) => updateDate(selectedYear, selectedMonth, e.target.value)}
            className="w-full bg-slate-900 border border-blue-500/20 text-blue-300 font-mono font-bold text-xs rounded-xl p-2.5 outline-none focus:border-blue-400 cursor-pointer text-center"
          >
            {daysArray.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                Dia {parseInt(d, 10)}
              </option>
            ))}
          </select>
        </div>

        {/* 2. SELEÇÃO DO MÊS */}
        <div>
          <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            2. Mês
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => updateDate(selectedYear, e.target.value, selectedDay)}
            className="w-full bg-slate-900 border border-blue-500/20 text-blue-300 font-bold text-xs rounded-xl p-2.5 outline-none focus:border-blue-400 cursor-pointer"
          >
            {MONTHS_PT.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.id} - {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. SELEÇÃO DO ANO */}
        <div>
          <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            3. Ano
          </label>
          <select
            value={selectedYear}
            onChange={(e) => updateDate(Number(e.target.value), selectedMonth, selectedDay)}
            className="w-full bg-slate-900 border border-blue-500/20 text-blue-300 font-mono font-bold text-xs rounded-xl p-2.5 outline-none focus:border-blue-400 cursor-pointer text-center"
          >
            {yearsList.map((y) => (
              <option key={y} value={y} className="bg-slate-900 text-white">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* READOUT CARD */}
      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-base">🗓️</span>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Data Agendada:</span>
            <span className="font-bold text-blue-300 font-serif text-xs">
              {formatFriendlyDate(selectedYear, selectedMonth, selectedDay)}
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-blue-400/20 text-blue-300 font-mono text-[10px] font-bold">
          {selectedYear}-{selectedMonth}-{selectedDay}
        </span>
      </div>

      {/* POPUP/EXPANDABLE VISUAL CALENDAR */}
      {isCalendarOpen && (
        <div className="p-3 bg-slate-900 rounded-2xl border border-blue-500/40 shadow-2xl space-y-3 animate-fade-up">
          {/* Calendar Header Navigation */}
          <div className="flex justify-between items-center px-1">
            <button
              type="button"
              onClick={() => {
                if (viewingMonth === 0) {
                  setViewingMonth(11);
                  setViewingYear(viewingYear - 1);
                } else {
                  setViewingMonth(viewingMonth - 1);
                }
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-blue-300 uppercase tracking-wide">
              {MONTHS_PT[viewingMonth]?.name} {viewingYear}
            </span>

            <button
              type="button"
              onClick={() => {
                if (viewingMonth === 11) {
                  setViewingMonth(0);
                  setViewingYear(viewingYear + 1);
                } else {
                  setViewingMonth(viewingMonth + 1);
                }
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-400">
            {WEEKDAYS_PT.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
}
