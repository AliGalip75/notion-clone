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
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { Plus, Trash2, Settings2, GripHorizontal } from "lucide-react";
import type { Block, ChartBlockData } from "@/types";

interface ChartBlockProps {
  block: Block;
}

const COLORS = [
  "#6366F1", // Indigo 500 (Vibrant, modern)
  "#38BDF8", // Light Blue 400
  "#34D399", // Emerald 400
  "#FBBF24", // Amber 400
  "#F87171", // Red 400
  "#C084FC", // Purple 400
  "#F472B6", // Pink 400
  "#2DD4BF"  // Teal 400
];

const ScifiChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const displayLabel = label || payload[0].name || payload[0].payload?.label;

    return (
      <div className="bg-background border border-[var(--color-border)] rounded shadow-sm text-foreground text-[10px] font-mono tracking-widest uppercase flex flex-col items-start justify-center" style={{ height: "auto", minHeight: "28px", padding: "8px 12px" }}>
        {displayLabel && <div className="text-[var(--color-text-secondary)] mb-1 border-b border-[var(--color-border)] w-full pb-1">{displayLabel}</div>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between w-full gap-4 mt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="scifi-tooltip-text whitespace-nowrap">{entry.name}</span>
            </div>
            <span className="scifi-tooltip-text font-bold whitespace-nowrap">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartBlock({ block }: ChartBlockProps) {
  const queryClient = useQueryClient();
  const data = block.data as unknown as ChartBlockData;
  const [title, setTitle] = useState(data.title || "Grafik");

  const updateBlock = useMutation({
    mutationFn: (newData: Partial<ChartBlockData>) =>
      pagesApi.updateBlock(block.id, { data: { ...data, ...newData } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", block.page] });
    },
  });

  const chartData = data.data || [{ label: "Oca", "Desktop": 30, "Mobile": 12, "Tablet": 18 }];
  const type = data.chartType || "bar";

  // Extract series names (keys other than 'label')
  const seriesKeys = chartData.length > 0
    ? Object.keys(chartData[0]).filter(k => k !== "label")
    : ["Değer"];

  const updateDataPoint = (index: number, key: string, val: string | number) => {
    const newData = [...chartData];
    newData[index] = { ...newData[index], [key]: val };
    updateBlock.mutate({ data: newData });
  };

  const removeDataPoint = (index: number) => {
    if (chartData.length <= 1) return;
    const newData = chartData.filter((_, i) => i !== index);
    updateBlock.mutate({ data: newData });
  };

  const addDataPoint = () => {
    const newPoint: any = { label: `Kategori ${chartData.length + 1}` };
    seriesKeys.forEach(k => newPoint[k] = 0);
    const newData = [...chartData, newPoint];
    updateBlock.mutate({ data: newData });
  };

  const addSeries = () => {
    const newSeriesName = `Seri ${seriesKeys.length + 1}`;
    const newData = chartData.map(point => ({ ...point, [newSeriesName]: 0 }));
    updateBlock.mutate({ data: newData });
  };

  const removeSeries = (seriesName: string) => {
    if (seriesKeys.length <= 1) return;
    const newData = chartData.map(point => {
      const newPoint = { ...point };
      delete newPoint[seriesName];
      return newPoint;
    });
    updateBlock.mutate({ data: newData });
  };

  const renameSeries = (oldName: string, newName: string) => {
    if (!newName || oldName === newName || seriesKeys.includes(newName)) return;
    const newData = chartData.map(point => {
      const newPoint = { ...point };
      newPoint[newName] = newPoint[oldName];
      delete newPoint[oldName];
      return newPoint;
    });
    updateBlock.mutate({ data: newData });
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ScifiChartTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-text)' }} />
              {seriesKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ScifiChartTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-text)' }} />
              {seriesKeys.map((key, i) => (
                <Area key={key} type="monotone" stackId="1" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.4} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
      case "donut":
        const isDonut = type === "donut";
        const firstSeriesKey = seriesKeys[0];

        return (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={isDonut ? 60 : 0}
                outerRadius={100}
                dataKey={firstSeriesKey}
                nameKey="label"
                stroke="var(--color-surface)"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ScifiChartTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-text)' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--color-text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<ScifiChartTooltip />} cursor={{ fill: "var(--color-bg-hover)" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--color-text)' }} />
              {seriesKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="py-4 my-2 border border-[var(--color-border)] rounded-lg group relative bg-[var(--color-surface)]">
      <div className="px-6 flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => { if (title !== data.title) updateBlock.mutate({ title }); }}
          className="text-lg font-semibold bg-transparent outline-none flex-1"
          style={{ color: "var(--color-text)" }}
          placeholder="Grafik Başlığı"
        />

        {/* Chart type switcher - visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {["bar", "line", "area", "pie", "donut"].map((t) => (
            <button
              key={t}
              onClick={() => updateBlock.mutate({ chartType: t as any })}
              className={`text-[10px] px-2 py-1 rounded capitalize transition-colors font-semibold ${type === t
                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)]"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-8 min-w-0 w-full overflow-hidden">
        <div className="w-full relative" style={{ height: '320px' }}>
          {renderChart()}
        </div>

        {/* Data Table */}
        <div className="flex flex-col w-full min-w-0">
          <div className="text-xs font-semibold uppercase text-[var(--color-text-tertiary)] mb-2 tracking-wider flex justify-between items-center">
            <span>Veri Tablosu</span>
            {!(type === "pie" || type === "donut") && (
              <button onClick={addSeries} className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
                <Plus size={12} /> Seri Ekle
              </button>
            )}
          </div>
          <div className="border border-[var(--color-border)] rounded overflow-x-auto notion-scrollbar w-full">
            <table className="w-full text-sm border-collapse whitespace-nowrap">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th className="text-left font-medium py-2 px-3 border-b border-r border-[var(--color-border)] min-w-[100px]">Kategori (Yatay)</th>
                  {(type === "pie" || type === "donut" ? [seriesKeys[0]] : seriesKeys).map((key, i) => (
                    <th key={key} className="text-left font-medium py-2 px-3 border-b border-r border-[var(--color-border)] min-w-[100px] relative group/th">
                      <div className="flex items-center gap-2">
                        {!(type === "pie" || type === "donut") && (
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        )}
                        <input
                          type="text"
                          defaultValue={key}
                          onBlur={(e) => renameSeries(key, e.target.value)}
                          className="bg-transparent outline-none w-full font-medium"
                        />
                        <button
                          onClick={() => removeSeries(key)}
                          disabled={seriesKeys.length <= 1}
                          className="opacity-0 group-hover/th:opacity-100 disabled:opacity-0 text-[var(--color-text-tertiary)] hover:text-red-500 absolute right-2 bg-[var(--color-bg-secondary)]"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="border-b border-[var(--color-border)] w-8 bg-[var(--color-bg-secondary)]"></th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((point, i) => (
                  <tr key={i} className="group/row hover:bg-[var(--color-bg-hover)]/50">
                    <td className="border-b border-r border-[var(--color-border)] p-0 relative">
                      <div className="flex items-center absolute inset-0 px-3 pointer-events-none">
                        {(type === "pie" || type === "donut") && (
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        )}
                      </div>
                      <input
                        type="text"
                        value={point.label}
                        onChange={(e) => updateDataPoint(i, "label", e.target.value)}
                        className={`w-full bg-transparent py-2 outline-none font-medium ${(type === "pie" || type === "donut") ? 'pl-7 pr-3' : 'px-3'}`}
                      />
                    </td>
                    {(type === "pie" || type === "donut" ? [seriesKeys[0]] : seriesKeys).map(key => (
                      <td key={key} className="border-b border-r border-[var(--color-border)] p-0">
                        <input
                          type="number"
                          value={point[key]}
                          onChange={(e) => updateDataPoint(i, key, Number(e.target.value) || 0)}
                          className="w-full bg-transparent px-3 py-2 outline-none text-[var(--color-text-secondary)]"
                        />
                      </td>
                    ))}
                    <td className="border-b border-[var(--color-border)] text-center p-0">
                      <button
                        onClick={() => removeDataPoint(i)}
                        disabled={chartData.length <= 1}
                        className="w-full h-full p-2 text-[var(--color-text-tertiary)] hover:text-red-500 opacity-0 group-hover/row:opacity-100 disabled:opacity-0 transition-opacity hover:cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addDataPoint}
              className="w-full py-2 flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <Plus size={14} />
              Yeni Kategori (yatay)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
