
import React from 'react';
import { Minus, Plus, Edit, Eye } from 'lucide-react';

interface EntryRowProps {
    entry: any;
    t: (key: string) => string;
    isDark: boolean;
    onUpdateBuffer: (id: string, amount: number, current: number) => void;
    onEdit: (entry: any) => void;
    limit: number;
    tempQty?: number;
    index: number;
    isStaffMode?: boolean;
    canChangeQty?: boolean;
    canEditItems?: boolean;
}

const EntryRow = React.memo<EntryRowProps>(({ entry, t, isDark, onUpdateBuffer, onEdit, limit, tempQty, index, isStaffMode = false, canChangeQty = true, canEditItems = true }) => {
    const displayQty = Number(tempQty !== undefined ? tempQty : entry.qty) || 0;
    const isChanged = tempQty !== undefined;
    const isLocked = isStaffMode && !canChangeQty;
    const isEditLocked = isStaffMode && !canEditItems;

    return (
        <div className={`flex items-center px-3 py-2 border-b transition-colors ${isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
            <div className="w-6 text-xs font-bold opacity-40">#{index + 1}</div>
            <div className="flex-[2] text-base font-bold truncate pr-2 leading-tight">{t(entry.car)}</div>

            {isLocked ? (
                /* Read-only quantity display for locked staff */
                <div className={`flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
                    <Eye size={14} className="opacity-40" />
                    <span className={`text-lg font-mono font-bold text-center ${displayQty < limit ? 'text-red-500' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{displayQty}</span>
                </div>
            ) : (
                /* Normal quantity controls */
                <div className={`flex items-center justify-center gap-3 rounded-lg p-1 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                    <button onClick={() => onUpdateBuffer(entry.id, -1, entry.qty)} className={`w-8 h-8 rounded border shadow-sm flex items-center justify-center active:scale-90 transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-red-400 active:bg-red-900/30' : 'bg-white border-gray-200 text-red-600 active:bg-red-100'}`}><Minus size={16} /></button>
                    <span className={`text-lg font-mono font-bold w-8 text-center transition-colors ${isChanged ? 'text-blue-500' : (displayQty < limit ? 'text-red-500 animate-pulse' : isDark ? 'text-slate-200' : 'text-slate-700')}`}>{displayQty}</span>
                    <button onClick={() => onUpdateBuffer(entry.id, 1, entry.qty)} className={`w-8 h-8 rounded border shadow-sm flex items-center justify-center active:scale-90 transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-green-400 active:bg-green-900/30' : 'bg-white border-gray-200 text-green-600 active:bg-green-100'}`}><Plus size={16} /></button>
                </div>
            )}

            {!isEditLocked && (
                <button onClick={() => onEdit(entry)} className={`ml-3 p-2 hover:text-blue-500 active:scale-90 transition-all rounded-full border ${isDark ? 'text-slate-500 bg-slate-800 border-slate-700 hover:bg-slate-700' : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                    <Edit size={16} />
                </button>
            )}
        </div>
    );
});

export default EntryRow;
