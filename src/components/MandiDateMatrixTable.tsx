import React from 'react';
import { useTranslation } from 'react-i18next';
import { type DateWiseMandiPrice } from '../data/mockMandiComparisonData';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface MandiDateMatrixTableProps {
  crop: string;
  records: DateWiseMandiPrice[];
  datesList: string[]; // List of 7 dates in ascending order
}

export const MandiDateMatrixTable: React.FC<MandiDateMatrixTableProps> = ({
  crop,
  records,
  datesList
}) => {
  const { t } = useTranslation();

  // Group records by mandi
  const mandisList = ['Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Lasalgaon', 'Sangamner', 'Nashik', 'Ahmednagar'];

  return (
    <Card hoverable={false} className="space-y-4 overflow-hidden border border-[#E1EBE1] rounded-2xl shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E1EBE1] pb-3">
        <h3 className="text-lg font-extrabold text-[#1B4332] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#FFC107]" />
          <span>
            {t(`crops.${crop}`, crop)} - 7-दिवसीय तुलनात्मक दर तक्ता (7-Day Price Matrix)
          </span>
        </h3>
        <span className="text-xs font-black text-[#2E7D32] bg-[#E8F5E9] px-3.5 py-1.5 rounded-full border border-[#81C784]/40">
          7-दिवसीय भाव चढ-उतार तक्ता
        </span>
      </div>

      {/* Rounded Container & Responsive Scrolling Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E1EBE1]">
        <table className="w-full text-left text-xs border-collapse custom-table">
          {/* Sticky Header */}
          <thead className="sticky top-0 bg-[#F7FBF7] z-20 border-b border-[#E1EBE1]">
            <tr>
              <th className="p-3.5 font-black text-[#1B4332] sticky left-0 bg-[#F7FBF7] border-r border-[#E1EBE1] z-30 shadow-xs">
                बाजार समिती (Mandi)
              </th>
              {datesList.map((dStr) => {
                const dateObj = new Date(dStr);
                const dayMonthStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
                return (
                  <th key={dStr} className="p-3.5 font-extrabold text-[#1B4332] text-center min-w-[110px]">
                    <div className="text-xs">{dayMonthStr}</div>
                    <div className="text-[10px] text-[#6B7280] font-bold">{dayName}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Alternate Row Colors & Hover Highlight */}
          <tbody className="divide-y divide-[#E1EBE1]">
            {mandisList.map((mandi) => {
              return (
                <tr key={mandi} className="even:bg-[#F7FBF7] odd:bg-[#FFFFFF] hover:bg-[#E8F5E9]/60 transition-colors duration-200">
                  {/* Mandi Name Sticky Column */}
                  <td className="p-3.5 font-extrabold text-[#2E7D32] sticky left-0 bg-[#FFFFFF] border-r border-[#E1EBE1] shadow-xs">
                    {t(`mandis.${mandi}`, mandi)}
                  </td>

                  {/* 7 Days Cells */}
                  {datesList.map((dStr, idx) => {
                    const currentRec = records.find((r) => r.mandiName === mandi && r.date === dStr && (r.crop === crop || r.commodity === crop));
                    const prevDateStr = idx > 0 ? datesList[idx - 1] : null;
                    const prevRec = prevDateStr ? records.find((r) => r.mandiName === mandi && r.date === prevDateStr && (r.crop === crop || r.commodity === crop)) : null;

                    if (!currentRec) {
                      return (
                        <td key={dStr} className="p-3.5 text-center text-[#9CA3AF] bg-[#F7FBF7] font-bold">
                          बंद (Closed)
                        </td>
                      );
                    }

                    let diff = 0;
                    if (prevRec) {
                      diff = currentRec.modalPrice - prevRec.modalPrice;
                    }

                    const isUp = diff > 0;
                    const isDown = diff < 0;

                    return (
                      <td
                        key={dStr}
                        className={`p-3.5 text-center border-r border-[#E1EBE1] transition-colors ${
                          isUp
                            ? 'bg-emerald-50 text-emerald-950 font-bold'
                            : isDown
                            ? 'bg-rose-50 text-rose-950 font-bold'
                            : 'text-[#1B4332]'
                        }`}
                      >
                        <div className="text-sm font-black">
                          ₹{currentRec.modalPrice.toLocaleString('en-IN')}
                        </div>
                        {prevRec && (
                          <div className="flex items-center justify-center gap-0.5 text-[10px] mt-0.5 font-bold">
                            {isUp && (
                              <span className="text-[#43A047] flex items-center font-extrabold">
                                <TrendingUp className="w-3 h-3" /> +₹{diff}
                              </span>
                            )}
                            {isDown && (
                              <span className="text-[#E53935] flex items-center font-extrabold">
                                <TrendingDown className="w-3 h-3" /> -₹{Math.abs(diff)}
                              </span>
                            )}
                            {!isUp && !isDown && (
                              <span className="text-[#6B7280] flex items-center font-bold">
                                <Minus className="w-3 h-3" /> ₹0
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#E1EBE1]">
        <div className="flex items-center gap-4 font-bold">
          <span className="flex items-center gap-1.5 text-emerald-900">
            <span className="w-3 h-3 rounded-full bg-emerald-300 border border-emerald-500 inline-block"></span>
            तेजी (भाव वाढ)
          </span>
          <span className="flex items-center gap-1.5 text-rose-900">
            <span className="w-3 h-3 rounded-full bg-rose-300 border border-rose-500 inline-block"></span>
            मंदी (भाव घट)
          </span>
        </div>
        <span className="font-extrabold text-[#2E7D32]">सर्व दर रु. प्रति क्विंटल मध्ये</span>
      </div>
    </Card>
  );
};
