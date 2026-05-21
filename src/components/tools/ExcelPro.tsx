import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Download, Table as TableIcon, GripVertical, GripHorizontal } from 'lucide-react';

interface ExcelProProps {
  onBack: () => void;
  isDark: boolean;
  t: (k: string) => string;
}

export const ExcelPro: React.FC<ExcelProProps> = ({ onBack, isDark, t }) => {
  const [columns, setColumns] = useState([
    { id: 'sr', name: '', width: 60, readOnly: true },
    { id: 'col1', name: 'A', width: 150, readOnly: false },
    { id: 'col2', name: 'B', width: 150, readOnly: false },
    { id: 'col3', name: 'C', width: 150, readOnly: false },
  ]);

  const [rows, setRows] = useState([
    { id: 1, height: 35, data: { sr: 1, col1: '', col2: '', col3: '' } },
    { id: 2, height: 35, data: { sr: 2, col1: '', col2: '', col3: '' } },
    { id: 3, height: 35, data: { sr: 3, col1: '', col2: '', col3: '' } },
    { id: 4, height: 35, data: { sr: 4, col1: '', col2: '', col3: '' } },
  ]);

  // Resizing state
  const [resizingCol, setResizingCol] = useState<{ id: string, startX: number, startWidth: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<{ id: number, startY: number, startHeight: number } | null>(null);

  const getNextColumnName = (colCount: number) => {
    // Generate Excel-like column names: A, B, C... Z, AA, AB...
    let name = '';
    let num = colCount - 1; // subtract 1 for 'sr' column
    while (num >= 0) {
      name = String.fromCharCode((num % 26) + 65) + name;
      num = Math.floor(num / 26) - 1;
    }
    return name;
  };

  const addColumn = () => {
    const newColId = `col${Date.now()}`;
    const newName = getNextColumnName(columns.length);
    setColumns([...columns, { id: newColId, name: newName, width: 150, readOnly: false }]);
    
    setRows(rows.map(row => ({
      ...row,
      data: { ...row.data, [newColId]: '' }
    })));
  };

  const removeColumn = (colId: string) => {
    if (columns.length <= 2) return;
    setColumns(columns.filter(c => c.id !== colId));
    setRows(rows.map(row => {
      const newData = { ...row.data };
      delete newData[colId];
      return { ...row, data: newData };
    }));
  };

  const addRow = () => {
    const newRowId = Date.now();
    const newRowData: any = { sr: rows.length + 1 };
    columns.forEach(c => {
      if (c.id !== 'sr') newRowData[c.id] = '';
    });
    setRows([...rows, { id: newRowId, height: 35, data: newRowData }]);
  };

  const removeRow = (rowId: number) => {
    const newRows = rows.filter(r => r.id !== rowId).map((row, idx) => ({
      ...row,
      data: { ...row.data, sr: idx + 1 }
    }));
    setRows(newRows);
  };

  const handleCellChange = (rowId: number, colId: string, value: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return { ...row, data: { ...row.data, [colId]: value } };
      }
      return row;
    }));
  };

  const handleHeaderChange = (colId: string, value: string) => {
    setColumns(columns.map(col => {
      if (col.id === colId) {
        return { ...col, name: value };
      }
      return col;
    }));
  };

  // --- Mouse Drag Logic for Resizing ---

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingCol) {
      const deltaX = e.clientX - resizingCol.startX;
      const newWidth = Math.max(50, resizingCol.startWidth + deltaX); // min width 50px
      setColumns(prev => prev.map(c => c.id === resizingCol.id ? { ...c, width: newWidth } : c));
    }
    if (resizingRow) {
      const deltaY = e.clientY - resizingRow.startY;
      const newHeight = Math.max(25, resizingRow.startHeight + deltaY); // min height 25px
      setRows(prev => prev.map(r => r.id === resizingRow.id ? { ...r, height: newHeight } : r));
    }
  }, [resizingCol, resizingRow]);

  const handleMouseUp = useCallback(() => {
    setResizingCol(null);
    setResizingRow(null);
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    if (resizingCol || resizingRow) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizingRow, handleMouseMove, handleMouseUp]);

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <div className={`flex items-center justify-between p-4 border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} transition-colors`}>
            <ArrowLeft size={24} />
          </button>
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-600 text-white shadow-sm">
              <TableIcon size={20} />
            </div>
            Excel Pro
          </h3>
        </div>
        
        <div className="flex gap-2">
          <button onClick={addColumn} className={`px-4 py-2 ${isDark ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} font-bold rounded-xl flex items-center gap-2 transition-colors`}>
            <Plus size={16} /> Column
          </button>
          <button onClick={addRow} className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-green-500 transition-colors shadow-sm">
            <Plus size={16} /> Row
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className={`flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-2 relative ${resizingCol ? 'cursor-col-resize' : ''} ${resizingRow ? 'cursor-row-resize' : ''}`}>
        
        <div className={`inline-block border shadow-xl ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-300 bg-white'}`}>
          <table className="border-collapse table-fixed" style={{ width: columns.reduce((acc, col) => acc + col.width, 0) + 40 }}>
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th 
                    key={col.id} 
                    style={{ width: col.width }}
                    className={`relative border-r border-b ${isDark ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-gray-300 bg-gray-100 text-gray-700'} p-0 select-none group`}
                  >
                    <div className="flex items-center justify-center h-8 font-semibold text-xs tracking-wider">
                      {col.readOnly ? (
                        <span className="opacity-50"></span>
                      ) : (
                        <input 
                          type="text" 
                          value={col.name} 
                          onChange={(e) => handleHeaderChange(col.id, e.target.value)}
                          className={`w-full h-full text-center bg-transparent outline-none ${isDark ? 'focus:bg-slate-700' : 'focus:bg-white'} transition-colors`}
                        />
                      )}
                    </div>
                    
                    {/* Delete Column Button (shows on hover) */}
                    {!col.readOnly && (
                      <button 
                        onClick={() => removeColumn(col.id)}
                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded transition-opacity bg-white/80 dark:bg-black/50"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    {/* Column Resize Handle */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 z-10 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setResizingCol({ id: col.id, startX: e.clientX, startWidth: col.width });
                        document.body.style.cursor = 'col-resize';
                      }}
                    />
                  </th>
                ))}
                {/* Extra header column for the row delete button */}
                <th className={`w-10 border-b ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-300 bg-gray-100'}`}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td 
                      key={col.id} 
                      style={{ width: col.width, height: row.height }}
                      className={`relative border-r border-b p-0 ${isDark ? 'border-slate-700' : 'border-gray-300'} ${col.readOnly ? (isDark ? 'bg-slate-800/50' : 'bg-gray-100') : ''} group`}
                    >
                      {col.readOnly ? (
                        <div className="w-full h-full flex flex-col items-center justify-center font-bold font-mono text-xs opacity-50 relative select-none">
                          {row.data[col.id]}
                          
                          {/* Row Resize Handle (Only on the 'sr' column, at the bottom) */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-500 active:bg-blue-600 z-10 transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setResizingRow({ id: row.id, startY: e.clientY, startHeight: row.height });
                              document.body.style.cursor = 'row-resize';
                            }}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={row.data[col.id]}
                          onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                          className={`w-full h-full outline-none px-2 text-sm bg-transparent ${isDark ? 'focus:ring-2 focus:ring-blue-500 focus:bg-slate-800' : 'focus:ring-2 focus:ring-blue-500 focus:bg-blue-50'} transition-all`}
                        />
                      )}
                    </td>
                  ))}
                  {/* Row Delete Button */}
                  <td className={`w-10 border-b text-center align-middle ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
                    <button 
                      onClick={() => removeRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors mx-auto block"
                      title="Delete Row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {rows.length === 0 && (
          <div className="p-12 text-center opacity-50 font-bold w-full max-w-md mx-auto mt-10">
            No rows in the spreadsheet. Click "Row" to start.
          </div>
        )}
      </div>
    </div>
  );
};
export default ExcelPro;
