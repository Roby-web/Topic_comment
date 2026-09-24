import React, { useState } from 'react';
import { ChevronUp, ChevronDown, BarChart3, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { SiteTrafficRow, TrafficMetric } from '../types';
import { formatSignedPercent } from '../services/apiService';

interface TrafficSectionProps {
  data: SiteTrafficRow[];
  lastUpdated?: string;
}

export const TrafficSection: React.FC<TrafficSectionProps> = ({ data, lastUpdated }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSiteHighlight, setActiveSiteHighlight] = useState<string | null>(null);

  // Render a cell metric with current value + Yest + Last Week
  const renderMetricCell = (metric: TrafficMetric, isArticles = false) => {
    const isYestPos = (metric.changeVsYesterday ?? 0) > 0;
    const isYestNeg = (metric.changeVsYesterday ?? 0) < 0;

    const isLwPos = (metric.changeVsLastWeek ?? 0) > 0;
    const isLwNeg = (metric.changeVsLastWeek ?? 0) < 0;

    return (
      <>
        {/* Current Day Value */}
        <td className="py-2.5 px-3 text-right font-medium text-slate-900 tabular-nums">
          {metric.formattedValue}
        </td>

        {/* Change vs Yesterday */}
        <td
          className={`py-2.5 px-2 text-right text-xs font-semibold tabular-nums ${
            isYestPos
              ? 'text-emerald-600'
              : isYestNeg
              ? 'text-rose-600'
              : 'text-slate-500'
          }`}
        >
          {formatSignedPercent(metric.changeVsYesterday)}
        </td>

        {/* Change vs Last Week */}
        <td
          className={`py-2.5 px-2 text-right text-xs font-semibold tabular-nums ${
            isLwPos
              ? 'text-emerald-600'
              : isLwNeg
              ? 'text-rose-600'
              : 'text-slate-500'
          }`}
        >
          {formatSignedPercent(metric.changeVsLastWeek)}
        </td>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Table Header Section with responsive scrolling */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Top Header Group */}
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold tracking-wider text-[11px]">
              <th scope="col" className="py-2.5 px-4 text-left uppercase w-32 sm:w-40 border-r border-slate-200">
                KÊNH
              </th>
              
              <th scope="col" colSpan={3} className="py-2.5 px-3 text-center uppercase border-r border-slate-200">
                USERS
              </th>

              <th scope="col" colSpan={3} className="py-2.5 px-3 text-center uppercase border-r border-slate-200">
                PAGEVIEWS
              </th>

              <th scope="col" colSpan={3} className="py-2.5 px-3 text-center uppercase">
                ARTICLES
              </th>
            </tr>

            {/* Sub Header for Comparisons (Yest / Last Week) */}
            <tr className="border-b border-slate-200 bg-white text-[11px] text-slate-500 font-medium">
              <th className="py-1 px-4 border-r border-slate-200"></th>

              {/* Users sub-cols */}
              <th className="py-1 px-3 text-right">Hôm nay</th>
              <th className="py-1 px-2 text-right font-medium text-slate-600">Yest</th>
              <th className="py-1 px-2 text-right font-medium text-slate-600 border-r border-slate-200">Last Week</th>

              {/* Pageviews sub-cols */}
              <th className="py-1 px-3 text-right">Hôm nay</th>
              <th className="py-1 px-2 text-right font-medium text-slate-600">Yest</th>
              <th className="py-1 px-2 text-right font-medium text-slate-600 border-r border-slate-200">Last Week</th>

              {/* Articles sub-cols */}
              <th className="py-1 px-3 text-right">Hôm nay</th>
              <th className="py-1 px-2 text-right font-medium text-slate-600">Yest</th>
              <th className="py-1 px-2 text-right font-medium text-slate-600">Last Week</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((row, idx) => {
              // Hide rows 1..n if collapsed, keeping only All Sites
              if (isCollapsed && !row.isTotal) {
                return null;
              }

              const isTotalRow = row.isTotal;

              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setActiveSiteHighlight(row.id)}
                  onMouseLeave={() => setActiveSiteHighlight(null)}
                  className={`transition-colors text-xs ${
                    isTotalRow
                      ? 'bg-slate-50/60 font-semibold text-slate-900 border-b border-slate-200'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Channel / Site Name */}
                  <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {isTotalRow && <span className="w-1.5 h-1.5 rounded-full bg-[#9f224e]" />}
                      <span>{row.name}</span>
                    </div>
                  </td>

                  {/* Users */}
                  {renderMetricCell(row.users)}

                  {/* Pageviews */}
                  {renderMetricCell(row.pageviews)}

                  {/* Articles */}
                  {renderMetricCell(row.articles, true)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Collapse / Expand Toggle Button matching image.png */}
      <div className="bg-white border-t border-slate-100 py-1.5 text-center">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="inline-flex items-center gap-1 text-xs text-[#9f224e] hover:text-[#7e173b] font-medium transition-colors cursor-pointer py-1 px-3 rounded hover:bg-rose-50"
        >
          <span>{isCollapsed ? 'Mở rộng chi tiết các site' : 'Thu gọn'}</span>
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
