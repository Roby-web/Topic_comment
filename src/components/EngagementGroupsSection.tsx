import React from 'react';
import { EngagementGroup } from '../types';

interface EngagementGroupsSectionProps {
  groups: EngagementGroup[];
  onSelectGroup?: (groupId: string) => void;
  selectedGroupId?: string | null;
}

export const EngagementGroupsSection: React.FC<EngagementGroupsSectionProps> = ({
  groups,
  onSelectGroup,
  selectedGroupId,
}) => {
  // Color configuration mapping to match image.png exactly
  const colorMap = {
    emerald: {
      border: 'border-emerald-300',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-200',
      bg: 'bg-emerald-50/40',
      title: 'text-emerald-700',
      number: 'text-emerald-600',
      barColor: 'bg-emerald-500',
    },
    purple: {
      border: 'border-purple-300',
      activeBorder: 'border-purple-500 ring-2 ring-purple-200',
      bg: 'bg-purple-50/40',
      title: 'text-purple-700',
      number: 'text-purple-600',
      barColor: 'bg-purple-500',
    },
    blue: {
      border: 'border-blue-300',
      activeBorder: 'border-blue-500 ring-2 ring-blue-200',
      bg: 'bg-blue-50/40',
      title: 'text-blue-700',
      number: 'text-blue-600',
      barColor: 'bg-blue-500',
    },
    amber: {
      border: 'border-amber-300',
      activeBorder: 'border-amber-500 ring-2 ring-amber-200',
      bg: 'bg-amber-50/40',
      title: 'text-amber-700',
      number: 'text-amber-600',
      barColor: 'bg-amber-500',
    },
    slate: {
      border: 'border-slate-300',
      activeBorder: 'border-slate-500 ring-2 ring-slate-200',
      bg: 'bg-slate-50/40',
      title: 'text-slate-700',
      number: 'text-slate-600',
      barColor: 'bg-slate-400',
    },
  };

  const formatDelta = (val: number | null) => {
    if (val === null || val === undefined) return '-';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}%`;
  };

  return (
    <div className="space-y-3">
      {/* 4 Cards Grid - Exact arrangement from image.png */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {groups.map((group) => {
          const style = colorMap[group.color] || colorMap.slate;
          const isSelected = selectedGroupId === group.id;

          const isYestPos = (group.pageviewChangeVsYesterday ?? 0) > 0;
          const isLwPos = (group.pageviewChangeVsLastWeek ?? 0) > 0;

          return (
            <div
              key={group.id}
              onClick={() => onSelectGroup && onSelectGroup(group.id)}
              className={`rounded-lg p-3.5 border transition-all cursor-pointer select-none relative ${
                style.bg
              } ${isSelected ? style.activeBorder : style.border} hover:shadow-sm`}
            >
              {/* Header: Group Name on Left, Yest/Last W on Right */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className={`text-xs font-bold uppercase tracking-wide ${style.title}`}>
                  {group.name}
                </span>

                {/* Top Right Mini Indicators */}
                <div className="text-[11px] text-right font-medium leading-tight">
                  <div className="text-slate-500">
                    <span>Yest: </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isYestPos ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatDelta(group.pageviewChangeVsYesterday)}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    <span>Last W: </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isLwPos ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatDelta(group.pageviewChangeVsLastWeek)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Big Metric Number + Share % */}
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-3xl font-extrabold tracking-tight tabular-nums ${style.number}`}>
                  {group.articleCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({group.articleSharePct}%)
                </span>
              </div>

              {/* Pageviews + Share % */}
              <div className="text-xs text-slate-600 font-medium mt-1 tabular-nums">
                {group.pageviewFormatted} ({group.pageviewSharePct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Proportion Bar (Article share vs PV share) */}
      <div className="bg-white border border-slate-200 rounded-md p-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 mb-1.5">
          <span className="font-semibold text-slate-700">Tương quan Tỉ trọng Bài viết vs Pageviews:</span>
          <span className="text-[11px] text-slate-400">
            Hiệu quả cao chiếm {groups[0]?.pageviewSharePct}% PV chỉ với {groups[0]?.articleSharePct}% lượng bài
          </span>
        </div>

        <div className="h-2 rounded-full overflow-hidden flex bg-slate-100 w-full">
          {groups.map((g) => {
            const style = colorMap[g.color] || colorMap.slate;
            return (
              <div
                key={g.id}
                style={{ width: `${g.articleSharePct}%` }}
                className={`${style.barColor} h-full transition-all`}
                title={`${g.name}: ${g.articleCount} bài (${g.articleSharePct}%)`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
