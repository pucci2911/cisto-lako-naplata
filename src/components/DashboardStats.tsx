import React from 'react';
import { getSettings } from '@/store/data';
import type { DashboardDisplayMode } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

interface StatCard {
  label: string;
  value: number;
  color: string;
}

interface DashboardStatsProps {
  cards: StatCard[];
  dailyData: { date: string; count: number }[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--warning, 45 93% 47%))',
  'hsl(var(--success, 142 76% 36%))',
  'hsl(var(--destructive))',
];

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'];

export default function DashboardStats({ cards, dailyData }: DashboardStatsProps) {
  const mode: DashboardDisplayMode = getSettings().dashboardDisplay || 'kartice';

  if (mode === 'kartice') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`bg-card rounded-xl p-5 shadow-sm shadow-black/5 border-l-4 ${card.color}`}>
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'pie') {
    const pieData = cards.map((c, i) => ({ name: c.label, value: c.value }));
    const total = pieData.reduce((s, d) => s + d.value, 0);
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Pregled porudžbina</h3>
        {total === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nema podataka za prikaz.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  if (mode === 'bar') {
    const BAR_LABELS: Record<string, [string, string]> = {
      'Aktivne porudžbine': ['Aktivne', 'porudžbine'],
      'Danas na čekanju': ['Danas na', 'čekanju'],
      'Spremno za preuzimanje': ['Spremno za', 'preuzimanje'],
      'Neplaćeno ili delimično': ['Neplaćeno', 'ili delimično'],
    };
    const barData = cards.map((c, i) => ({ name: c.label, value: c.value, fill: PIE_COLORS[i] }));
    const renderBarTick = ({ x, y, payload }: any) => {
      const lines = BAR_LABELS[payload.value] || [payload.value, ''];
      return (
        <text x={x} y={y + 12} textAnchor="middle" fontSize={11} fill="currentColor" className="fill-muted-foreground">
          <tspan x={x} dy="0">{lines[0]}</tspan>
          <tspan x={x} dy="14">{lines[1]}</tspan>
        </text>
      );
    };
    return (
      <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Poređenje statistika</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} barSize={48} margin={{ bottom: 20 }}>
            <XAxis dataKey="name" tick={renderBarTick} interval={0} tickLine={false} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // line
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm shadow-black/5 mb-8">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Porudžbine po danu (poslednjih 7 dana)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke={PIE_COLORS[0]} strokeWidth={2.5} dot={{ r: 4 }} name="Porudžbine" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
