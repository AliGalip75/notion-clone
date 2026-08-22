import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/api/pages";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { Block, ChartBlockData } from "@/types";

interface ChartBlockProps {
  block: Block;
}

const COLORS = ["#2383e2", "#eb5757", "#4daa57", "#f2a93b", "#9ca3af"];

export default function ChartBlock({ block }: ChartBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as ChartBlockData;
  const [title, setTitle] = useState(data.title || "Grafik");
  
  // For MVP, we're making the chart type toggleable but the data static or editable via raw JSON only.
  // Building a full spreadsheet-like data editor for Recharts is too complex for this MVP phase.

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<ChartBlockData>) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const chartData = data.data || [{ label: "Öğe 1", value: 10 }];
  const type = data.chartType || "bar";

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="label"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
                cursor={{ fill: "var(--color-bg-hover)" }}
              />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="py-4 my-2 border border-[var(--color-border)] rounded-lg group relative">
      <div className="px-4 flex items-center justify-between mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if (title !== data.title) updateBlock.mutate({ title }); }}
          className="text-lg font-semibold bg-transparent outline-none flex-1"
          style={{ color: "var(--color-text)" }}
        />
        
        {/* Chart type switcher - visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {["bar", "line", "pie"].map((t) => (
            <button
              key={t}
              onClick={() => updateBlock.mutate({ chartType: t as any })}
              className={`text-xs px-2 py-1 rounded capitalize transition-colors ${
                type === t 
                  ? "bg-[var(--color-bg-active)] text-[var(--color-text)]" 
                  : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="px-2">
        {renderChart()}
      </div>
    </div>
  );
}
