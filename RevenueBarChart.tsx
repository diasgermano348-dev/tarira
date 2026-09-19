import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { data2025, data2026 } from './data';

export const RevenueBarChart: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2025);
  const currentData = selectedYear === 2025 ? data2025 : data2026;

  const formatMZN = (val: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      maximumFractionDigits: 0
    }).format(val).replace('MTn', 'MZN');
  };

  const formatShortMZN = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M MT';
    }
    return (val / 1000).toFixed(0) + 'K MT';
  };

  const totalProjetado = currentData.reduce((acc, item) => acc + item.projetado, 0);
  const totalRealizado = currentData.reduce((acc, item) => acc + item.realizado, 0);

  const completedMonths = currentData.filter(d => d.realizado > 0);
  const totalProjetadoCompleted = completedMonths.reduce((acc, item) => acc + item.projetado, 0);
  const totalRealizadoCompleted = completedMonths.reduce((acc, item) => acc + item.realizado, 0);

  const executionRate = totalProjetadoCompleted > 0
    ? Math.round((totalRealizadoCompleted / totalProjetadoCompleted) * 100)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const proj = payload.find((p: any) => p.dataKey === 'projetado')?.value || 0;
      const real = payload.find((p: any) => p.dataKey === 'realizado')?.value || 0;
      const diff = real - proj;
      const pct = proj > 0 ? Math.round((real / proj) * 100) : 0;

      return (
        <div className="p-3 bg-slate-900 border border-blue-500/30 rounded-xl shadow-2xl space-y-2 text-xs max-w-xs z-50">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-1.5">
            <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
              🗓️ {label} de {selectedYear}
            </span>
            {real > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                diff >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {pct}% da Meta
              </span>
            )}
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-400 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span> Projetado:
              </span>
              <span className="text-white font-bold">{formatMZN(proj)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block"></span> Realizado:
              </span>
              <span className="text-white font-extrabold">
                {real > 0 ? formatMZN(real) : 'Aguardando fecho'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl p-5 sm:p-6 border border-slate-800 bg-slate-950/80 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-500/30">
              📊 Recharts Interactive
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              Live Comparativo
            </span>
          </div>
          <h3 className="font-serif text-xl text-white font-bold mt-1">
            Faturamento Mensal Projetado vs. Realizado
          </h3>
          <p className="text-xs text-slate-400">
            Acompanhamento analítico da meta financeira em Meticais (MZN).
          </p>
        </div>

        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-blue-500/30 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedYear(2025)}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              selectedYear === 2025
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ano 2025
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear(2026)}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              selectedYear === 2026
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ano 2026 (Atual)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/20 space-y-1">
          <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold block">
            Projetado Total ({selectedYear})
          </span>
          <span className="text-lg font-bold font-mono text-white block truncate">
            {formatShortMZN(totalProjetado)}
          </span>
          <span className="text-[10px] text-slate-500 block">Orçamento aprovado</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-1">
          <span className="text-[10px] font-mono text-slate-300 uppercase font-semibold block">
            Realizado Acumulado
          </span>
          <span className="text-lg font-bold font-mono text-white block truncate">
            {formatShortMZN(totalRealizado)}
          </span>
          <span className="text-[10px] text-slate-500 block">{completedMonths.length} meses apurados</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block">
            Execução da Meta
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400 block">
            {executionRate}%
          </span>
          <span className="text-[10px] text-emerald-400/80 block">Superou a meta projetada</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/20 space-y-1">
          <span className="text-[10px] font-mono text-blue-300 uppercase font-semibold block">
            Crescimento YoY
          </span>
          <span className="text-lg font-bold font-mono text-white block">
            {selectedYear === 2026 ? '+118%' : '+34%'}
          </span>
          <span className="text-[10px] text-slate-500 block">Expansão de mercado</span>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={currentData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickFormatter={formatShortMZN}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '11px', color: '#cbd5e1' }}
              formatter={(value) => {
                return value === 'projetado' ? ' Faturamento Projetado (Meta)' : ' Faturamento Realizado (Efetivo)';
              }}
            />
            <Bar
              dataKey="projetado"
              name="projetado"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="realizado"
              name="realizado"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
