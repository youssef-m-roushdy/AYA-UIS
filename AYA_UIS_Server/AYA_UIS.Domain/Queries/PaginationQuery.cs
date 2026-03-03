using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AYA_UIS.Domain.Queries
{
    public enum SortDirection
    {
        Ascending,
        Descending
    }

    public class PaginationQuery
    {
        private int _pageNumber = 1;
        private int _pageSize = 10;
        private const int MaxPageSize = 50;

        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = value < 1 ? 1 : value;
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 10 : value > MaxPageSize ? MaxPageSize : value;
        }

        public string? SortBy { get; set; }
        public SortDirection SortDirection { get; set; } = SortDirection.Ascending;
        public string? SearchTerm { get; set; }
    }
}
