import React, { useState, useRef, useEffect } from 'react';
import { FiArrowUp, FiArrowDown, FiChevronDown, FiCheck } from 'react-icons/fi';
import { RiSortAsc } from 'react-icons/ri';

export default function SortMenu({
  sortBy,
  sortDirection,
  onSortChange,
  sortOptions = [],
  isLoading = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleSort = field => {
    const newDirection =
      sortBy === field && sortDirection === 'Ascending'
        ? 'Descending'
        : 'Ascending';
    if (onSortChange) onSortChange(field, newDirection);
    setShowMenu(false);
  };

  const getCurrentSortLabel = () => {
    if (!sortBy) return 'Sort';
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : sortBy;
  };

  const isActive = !!sortBy;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .sort-root {
          position: relative;
          font-family: 'DM Sans', sans-serif;
        }

        .sort-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          letter-spacing: -0.01em;
          user-select: none;
        }

        .sort-trigger:hover:not(:disabled) {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: #1e293b;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .sort-trigger.active {
          border-color: #6366f1;
          background: #eef2ff;
          color: #4338ca;
          box-shadow: 0 1px 3px rgba(99,102,241,0.15);
        }

        .sort-trigger.active:hover:not(:disabled) {
          background: #e0e7ff;
          border-color: #4f46e5;
        }

        .sort-trigger:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .sort-trigger .icon-sort {
          color: currentColor;
          flex-shrink: 0;
          opacity: 0.75;
        }

        .sort-trigger .chevron {
          margin-left: 1px;
          opacity: 0.5;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .sort-trigger .chevron.open {
          transform: rotate(180deg);
        }

        .sort-trigger .dir-arrow {
          display: inline-flex;
          align-items: center;
          margin-left: 1px;
          color: #6366f1;
        }

        /* Dropdown */
        .sort-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 210px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 100;
          overflow: hidden;
          animation: dropIn 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
          transform-origin: top left;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .sort-dropdown-header {
          padding: 8px 12px 6px;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }

        .sort-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0 10px;
        }

        .sort-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 13.5px;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s ease, color 0.12s ease;
          position: relative;
        }

        .sort-option:hover {
          background: #f8fafc;
          color: #1e293b;
        }

        .sort-option.selected {
          background: #f5f3ff;
          color: #4338ca;
          font-weight: 500;
        }

        .sort-option.selected:hover {
          background: #ede9fe;
        }

        .sort-option-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #94a3b8;
          font-size: 11px;
          transition: background 0.12s, color 0.12s;
        }

        .sort-option.selected .sort-option-icon {
          background: #ede9fe;
          color: #6366f1;
        }

        .sort-option-label {
          flex: 1;
        }

        .sort-option-right {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .sort-option-check {
          color: #6366f1;
          display: flex;
          align-items: center;
        }

        .sort-option-dir {
          display: flex;
          align-items: center;
          color: #6366f1;
          font-size: 11px;
          background: #e0e7ff;
          border-radius: 4px;
          padding: 1px 5px;
          gap: 2px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="sort-root" ref={menuRef}>
        <button
          onClick={() =>
            !isLoading && sortOptions.length > 0 && setShowMenu(v => !v)
          }
          disabled={isLoading || sortOptions.length === 0}
          className={`sort-trigger${isActive ? ' active' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={showMenu}
        >
          <RiSortAsc size={15} className="icon-sort" />
          <span>{getCurrentSortLabel()}</span>
          {isActive && (
            <span className="dir-arrow">
              {sortDirection === 'Ascending' ? (
                <FiArrowUp size={12} />
              ) : (
                <FiArrowDown size={12} />
              )}
            </span>
          )}
          <FiChevronDown
            size={13}
            className={`chevron${showMenu ? ' open' : ''}`}
          />
        </button>

        {showMenu && sortOptions.length > 0 && (
          <div className="sort-dropdown" role="listbox">
            <div className="sort-dropdown-header">Sort by</div>
            <div className="sort-divider" />
            {sortOptions.map((option, i) => {
              const selected = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  className={`sort-option${selected ? ' selected' : ''}`}
                  onClick={() => handleSort(option.value)}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="sort-option-icon">
                    {option.icon || (i % 2 === 0 ? '↑↓' : '⊞')}
                  </span>
                  <span className="sort-option-label">{option.label}</span>
                  <span className="sort-option-right">
                    {selected && (
                      <>
                        <span className="sort-option-dir">
                          {sortDirection === 'Ascending' ? (
                            <>
                              <FiArrowUp size={10} /> Asc
                            </>
                          ) : (
                            <>
                              <FiArrowDown size={10} /> Desc
                            </>
                          )}
                        </span>
                        <span className="sort-option-check">
                          <FiCheck size={14} />
                        </span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
