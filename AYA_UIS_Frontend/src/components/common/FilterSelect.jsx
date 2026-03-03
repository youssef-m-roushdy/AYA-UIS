import React, { useState, useRef, useEffect } from 'react';
import { FiCheck, FiChevronDown, FiX, FiSearch } from 'react-icons/fi';

/**
 * FilterSelect — Professional custom dropdown (no <select>), uses ul/li.
 *
 * Props:
 *  label        {string}   Label shown above the trigger
 *  value        {string}   Controlled selected value
 *  onChange     {fn}       Called with new value ('' = clear)
 *  options      {Array}    [{ value, label, dotColor?, description?, icon? }]
 *  placeholder  {string}   Trigger text when nothing selected
 *  icon         {node}     Optional leading icon in trigger
 *  searchable   {boolean}  Show search input (auto-enabled if options > 6)
 */
export default function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'All',
  icon = null,
  searchable,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  const shouldSearch = searchable ?? options.length > 6;

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      if (shouldSearch) setTimeout(() => searchRef.current?.focus(), 60);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [open, shouldSearch]);

  const selected = options.find(o => o.value === value);
  const isActive = !!value;

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = optValue => {
    onChange(optValue === value ? '' : optValue);
    setOpen(false);
    setSearch('');
  };

  const DOT_COLORS = {
    success: '#10b981',
    danger:  '#ef4444',
    warning: '#f59e0b',
    info:    '#3b82f6',
    purple:  '#8b5cf6',
    pink:    '#ec4899',
    neutral: '#94a3b8',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

        .fsl-wrap {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          gap: 5px;
          font-family: 'DM Sans', sans-serif;
        }

        .fsl-label {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          padding-left: 2px;
          user-select: none;
        }

        /* ── Trigger ── */
        .fsl-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          height: 38px;
          min-width: 160px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-size: 13.5px;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          user-select: none;
          white-space: nowrap;
          outline: none;
          text-align: left;
        }

        .fsl-trigger:hover {
          border-color: #a5b4fc;
          background: #fafbff;
          color: #334155;
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
        }

        .fsl-trigger.is-open {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        .fsl-trigger.is-active {
          border-color: #6366f1;
          background: #eef2ff;
          color: #4338ca;
          font-weight: 500;
        }

        .fsl-trigger.is-active:hover {
          background: #e5e8fd;
        }

        .fsl-trigger-icon {
          display: flex;
          align-items: center;
          color: #94a3b8;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .fsl-trigger.is-active .fsl-trigger-icon { color: #818cf8; }

        .fsl-trigger-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fsl-trigger-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .fsl-clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: none;
          background: rgba(99,102,241,0.15);
          color: #6366f1;
          cursor: pointer;
          padding: 0;
          transition: background 0.12s, transform 0.12s;
        }
        .fsl-clear-btn:hover {
          background: rgba(99,102,241,0.3);
          transform: scale(1.1);
        }

        .fsl-chevron {
          color: #94a3b8;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), color 0.15s;
        }
        .fsl-trigger.is-open .fsl-chevron  { color: #6366f1; transform: rotate(180deg); }
        .fsl-trigger.is-active .fsl-chevron { color: #818cf8; }
        .fsl-trigger.is-open.is-active .fsl-chevron { transform: rotate(180deg); }

        /* ── Panel ── */
        .fsl-panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: max(100%, 210px);
          background: #fff;
          border: 1.5px solid #e8edf5;
          border-radius: 13px;
          box-shadow:
            0 4px 6px -1px rgba(0,0,0,0.06),
            0 16px 40px -4px rgba(0,0,0,0.11);
          z-index: 600;
          overflow: hidden;
          animation: fsl-pop 0.17s cubic-bezier(0.16,1,0.3,1) both;
          transform-origin: top left;
        }

        @keyframes fsl-pop {
          from { opacity: 0; transform: scale(0.93) translateY(-7px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }

        /* Search */
        .fsl-search-box {
          padding: 8px 8px 5px;
          border-bottom: 1px solid #f1f5f9;
        }

        .fsl-search-row {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #f8fafc;
          border: 1.5px solid #e8edf5;
          border-radius: 8px;
          padding: 0 10px;
          height: 33px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .fsl-search-row:focus-within {
          border-color: #a5b4fc;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }
        .fsl-search-icon { color: #cbd5e1; flex-shrink: 0; }
        .fsl-search-input {
          border: none;
          background: transparent;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #334155;
          outline: none;
          flex: 1;
          min-width: 0;
        }
        .fsl-search-input::placeholder { color: #cbd5e1; }

        /* List */
        .fsl-list {
          list-style: none;
          margin: 0;
          padding: 5px;
          max-height: 228px;
          overflow-y: auto;
        }
        .fsl-list::-webkit-scrollbar { width: 4px; }
        .fsl-list::-webkit-scrollbar-track { background: transparent; }
        .fsl-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

        /* Item */
        .fsl-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.1s;
          outline: none;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .fsl-item:hover { background: #f8fafc; }

        .fsl-item.fsl-selected { background: #eef2ff; }
        .fsl-item.fsl-selected:hover { background: #e5e8fd; }

        /* Dot */
        .fsl-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #cbd5e1;
          transition: transform 0.15s;
        }
        .fsl-item.fsl-selected .fsl-dot { transform: scale(1.25); }

        /* Option icon chip */
        .fsl-opt-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          color: #64748b;
          transition: background 0.12s, color 0.12s;
        }
        .fsl-item.fsl-selected .fsl-opt-icon {
          background: #e0e7ff;
          color: #6366f1;
        }

        /* Text */
        .fsl-text { flex: 1; min-width: 0; }

        .fsl-main {
          font-size: 13.5px;
          font-weight: 400;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .fsl-item.fsl-selected .fsl-main { color: #4338ca; font-weight: 500; }

        .fsl-desc {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        /* Check badge */
        .fsl-check {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          background: #6366f1;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: fsl-check-in 0.16s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes fsl-check-in {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        /* Empty */
        .fsl-empty {
          padding: 22px 12px;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
        }
      `}</style>

      <div className="fsl-wrap" ref={ref}>
        {label && <span className="fsl-label">{label}</span>}

        {/* ── Trigger ── */}
        <button
          type="button"
          className={[
            'fsl-trigger',
            open     ? 'is-open'   : '',
            isActive ? 'is-active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => setOpen(v => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {icon && <span className="fsl-trigger-icon">{icon}</span>}

          {isActive && selected?.dotColor && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: DOT_COLORS[selected.dotColor] ?? '#6366f1',
              }}
            />
          )}

          <span className="fsl-trigger-text">
            {selected ? selected.label : placeholder}
          </span>

          <span className="fsl-trigger-actions">
            {isActive && (
              <button
                type="button"
                className="fsl-clear-btn"
                onClick={e => { e.stopPropagation(); onChange(''); }}
                aria-label="Clear selection"
              >
                <FiX size={10} />
              </button>
            )}
            <FiChevronDown size={14} className="fsl-chevron" />
          </span>
        </button>

        {/* ── Dropdown panel ── */}
        {open && (
          <div className="fsl-panel" role="listbox" aria-label={label}>

            {shouldSearch && (
              <div className="fsl-search-box">
                <div className="fsl-search-row">
                  <FiSearch size={13} className="fsl-search-icon" />
                  <input
                    ref={searchRef}
                    type="text"
                    className="fsl-search-input"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      style={{
                        background: 'none', border: 'none',
                        color: '#94a3b8', cursor: 'pointer',
                        padding: 0, display: 'flex', alignItems: 'center',
                      }}
                    >
                      <FiX size={11} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <ul className="fsl-list">
              {filtered.length === 0 ? (
                <li className="fsl-empty">No results found</li>
              ) : (
                filtered.map(opt => {
                  const isSelected = opt.value === value;
                  const dotColor   = DOT_COLORS[opt.dotColor];

                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      className={`fsl-item${isSelected ? ' fsl-selected' : ''}`}
                      onClick={() => handleSelect(opt.value)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(opt.value)}
                      tabIndex={0}
                    >
                      {opt.icon ? (
                        <span className="fsl-opt-icon">{opt.icon}</span>
                      ) : (
                        <span
                          className="fsl-dot"
                          style={dotColor ? { background: dotColor } : {}}
                        />
                      )}

                      <span className="fsl-text">
                        <span className="fsl-main">{opt.label}</span>
                        {opt.description && (
                          <span className="fsl-desc">{opt.description}</span>
                        )}
                      </span>

                      {isSelected && (
                        <span className="fsl-check">
                          <FiCheck size={11} />
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}