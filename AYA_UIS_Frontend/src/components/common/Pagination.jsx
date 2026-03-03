import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  sortBy = null,
  sortDirection = 'Ascending',
  isLoading = false,
}) {
  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handleSort = (field, direction) => {
    if (onSortChange) {
      onSortChange(field, direction);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: 'var(--bg-light)',
        borderRadius: '6px',
        flexWrap: 'wrap',
      }}
    >
      {/* Info Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.875rem',
          color: 'var(--text)',
        }}
      >
        <span>
          {totalCount > 0
            ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)}`
            : '0'}{' '}
          of {totalCount} items
        </span>
      </div>

      {/* Page Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || isLoading}
          className="btn btn-sm btn-ghost"
          title="Previous page"
          style={{
            cursor: currentPage === 1 || isLoading ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 || isLoading ? 0.5 : 1,
          }}
        >
          <FiChevronLeft size={18} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            minWidth: '100px',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '0.875rem' }}>
            Page <strong>{currentPage}</strong> of{' '}
            <strong>{totalPages || 1}</strong>
          </span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="btn btn-sm btn-ghost"
          title="Next page"
          style={{
            cursor:
              currentPage >= totalPages || isLoading
                ? 'not-allowed'
                : 'pointer',
            opacity: currentPage >= totalPages || isLoading ? 0.5 : 1,
          }}
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
