using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shared.Respones
{
    public class PagedResponse<T>
    {
        public bool Success { get; set; }
        public IEnumerable<T>? Data { get; set; }
        public PaginationMetadata? Pagination { get; set; }
        public string? Errors { get; set; }
        public string? Message { get; set; }

        public static PagedResponse<T> SuccessResponse(IEnumerable<T> data, int pageNumber, int pageSize, int totalCount)
        {
            return new PagedResponse<T>
            {
                Success = true,
                Data = data,
                Pagination = new PaginationMetadata
                {
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    TotalCount = totalCount,
                    HasNextPage = pageNumber < (int)Math.Ceiling((double)totalCount / pageSize),
                    HasPreviousPage = pageNumber > 1
                },
                Message = "Operation completed successfully"
            };
        }

        public static PagedResponse<T> ErrorResponse(string error)
        {
            return new PagedResponse<T>
            {
                Success = false,
                Data = default,
                Pagination = null,
                Errors = error,
                Message = "Operation failed"
            };
        }
    }

    public class PaginationMetadata
    {
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public int TotalCount { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }
}
