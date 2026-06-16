"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint } from "@/lib/types";
import { formatCompact, formatFull } from "@/lib/format";

/** Grafico di crescita storico (brief, sez. 11 Fase 0). */
export function GrowthChart({
  data,
  color = "#2DE3B0",
  height = 220,
}: {
  data: HistoryPoint[];
  color?: string;
  height?: number;
}) {
  const id = `grad-${color.replace("#", "")}`;
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: "#8A86A0", fontSize: 11 }}
            tickFormatter={(d: string) => d.slice(5)}
            minTickGap={28}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8A86A0", fontSize: 11 }}
            tickFormatter={(v: number) => formatCompact(v)}
            width={48}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#1E1B2A",
              border: "1px solid #322D44",
              borderRadius: 8,
              color: "#ECECF2",
              fontSize: 12,
            }}
            labelStyle={{ color: "#8A86A0" }}
            formatter={(v) => [formatFull(Number(v)), "valore"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
