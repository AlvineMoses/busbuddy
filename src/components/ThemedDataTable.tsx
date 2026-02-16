import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

// ============================================
// THEMED DATA TABLE
// A reusable, prop-driven data table component
// that eliminates table boilerplate across pages.
//
// Supports:
// - Column definitions with custom renderers
// - MoreHorizontal action menus
// - Empty state with icon + message
// - Two size variants: default (px-8 py-5/6) and compact (px-6 py-4)
// - Optional container wrapper (rounded card with shadow)
// - Row click handlers
// - Sticky headers
// ============================================

/** Column definition for ThemedDataTable */
export interface TableColumn<T> {
  /** Column header label */
  header: string;
  /** Unique key for React rendering */
  key: string;
  /** Custom cell renderer. Receives the row item and row index. */
  render: (item: T, index: number) => React.ReactNode;
  /** Header alignment */
  headerAlign?: 'left' | 'center' | 'right';
  /** Extra className for th */
  headerClassName?: string;
  /** Extra className for td */
  cellClassName?: string;
}

/** Action menu item for the MoreHorizontal dropdown */
export interface ActionMenuItem<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
  /** If true, a divider is rendered before this item */
  divider?: boolean;
  /** Hide this item conditionally */
  hidden?: (item: T) => boolean;
}

/** Props for ThemedDataTable */
export interface ThemedDataTableProps<T> {
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Data array */
  data: T[];
  /** Unique key extractor for each row */
  rowKey: (item: T, index: number) => string | number;
  /** Action menu items (renders MoreHorizontal column automatically) */
  actions?: ActionMenuItem<T>[];
  /** Custom actions column renderer (overrides `actions` prop) */
  renderActions?: (item: T, index: number) => React.ReactNode;
  /** Action column header text */
  actionsHeader?: string;
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Empty state icon (lucide component) */
  emptyIcon?: React.ReactNode;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state subtitle */
  emptySubtitle?: string;
  /** Size variant */
  variant?: 'default' | 'compact';
  /** Wrap in a rounded card container */
  container?: boolean;
  /** Container className override */
  containerClassName?: string;
  /** Extra className on the <table> element */
  tableClassName?: string;
  /** Sticky thead */
  stickyHeader?: boolean;
  /** Extra className for each row */
  rowClassName?: (item: T, index: number) => string;
  /** Min height for the container */
  minHeight?: string;
}

/**
 * ThemedDataTable — universal data table component.
 *
 * Eliminates repeated table markup across pages while keeping
 * full flexibility via column render functions and action menus.
 */
export function ThemedDataTable<T>({
  columns,
  data,
  rowKey,
  actions,
  renderActions,
  actionsHeader = 'Action',
  onRowClick,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  variant = 'default',
  container = false,
  containerClassName,
  tableClassName,
  stickyHeader = false,
  rowClassName,
  minHeight,
}: ThemedDataTableProps<T>) {
  const [openActionId, setOpenActionId] = useState<string | number | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  // Close action menu on outside click
  useEffect(() => {
    if (openActionId === null) return;
    const handler = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openActionId]);

  const isDefault = variant === 'default';
  const cellPx = isDefault ? 'px-8' : 'px-6';
  const cellPy = isDefault ? 'py-5' : 'py-4';
  const headPy = isDefault ? 'py-6' : 'py-4';
  const hasActions = !!actions?.length || !!renderActions;

  const table = (
    <>
      <div className="overflow-x-auto">
        <table className={`w-full text-left ${tableClassName || ''}`}>
          <thead className={`bg-gray-50/50 text-gray-400 font-bold text-xs uppercase tracking-widest ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  className={`${cellPx} ${headPy} ${i === 0 && isDefault ? 'pl-10' : ''} ${
                    col.headerAlign === 'center' ? 'text-center' : col.headerAlign === 'right' ? 'text-right' : 'text-left'
                  } ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
              {hasActions && (
                <th className={`${cellPx} ${headPy} text-right ${isDefault ? 'pr-10' : ''}`}>
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item, idx) => {
              const key = rowKey(item, idx);
              return (
                <tr
                  key={key}
                  className={`hover:bg-gray-50/80 transition-colors group ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName?.(item, idx) || ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, i) => (
                    <td
                      key={col.key}
                      className={`${cellPx} ${cellPy} ${i === 0 && isDefault ? 'pl-10' : ''} ${col.cellClassName || ''}`}
                    >
                      {col.render(item, idx)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className={`${cellPx} ${cellPy} text-right ${isDefault ? 'pr-10' : ''} relative`}>
                      {renderActions ? (
                        renderActions(item, idx)
                      ) : actions ? (
                        <div ref={openActionId === key ? actionRef : undefined}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(prev => prev === key ? null : key);
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:bg-brand-black hover:text-white transition-all z-10 relative"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                          {openActionId === key && (
                            <div className="absolute right-10 top-12 mt-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                              {actions
                                .filter(a => !a.hidden?.(item))
                                .map((action, ai) => (
                                  <React.Fragment key={ai}>
                                    {action.divider && <div className="h-px bg-gray-50 my-1" />}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick(item);
                                        setOpenActionId(null);
                                      }}
                                      className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-colors ${
                                        action.className || 'text-gray-600'
                                      }`}
                                    >
                                      {action.icon} {action.label}
                                    </button>
                                  </React.Fragment>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && emptyTitle && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          {emptyIcon}
          <p className="text-lg font-medium text-gray-600 mt-4">{emptyTitle}</p>
          {emptySubtitle && <p className="text-sm mt-1">{emptySubtitle}</p>}
        </div>
      )}
    </>
  );

  if (container) {
    return (
      <div
        className={containerClassName || 'bg-white rounded-[2.5rem] shadow-soft-xl border border-gray-100 overflow-hidden'}
        style={minHeight ? { minHeight } : undefined}
      >
        {table}
      </div>
    );
  }

  return table;
}
