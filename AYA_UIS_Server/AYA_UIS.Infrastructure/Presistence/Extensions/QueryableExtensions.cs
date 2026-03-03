using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Queries;
using Microsoft.EntityFrameworkCore;

namespace AYA_UIS.Infrastructure.Presistence.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> ApplyPagination<T>(
            this IQueryable<T> query,
            PaginationQuery pagination) where T : class
        {
            if (pagination == null)
                return query;

            var skip = (pagination.PageNumber - 1) * pagination.PageSize;
            return query.Skip(skip).Take(pagination.PageSize);
        }

        public static IQueryable<T> ApplySorting<T>(
            this IQueryable<T> query,
            string? sortBy,
            SortDirection sortDirection) where T : class
        {
            if (string.IsNullOrEmpty(sortBy))
                return query;

            // Use reflection to get the property
            var param = System.Linq.Expressions.Expression.Parameter(typeof(T), "x");
            var property = System.Linq.Expressions.Expression.Property(param, sortBy);
            var lambda = System.Linq.Expressions.Expression.Lambda(property, param);

            var methodName = sortDirection == SortDirection.Descending ? "OrderByDescending" : "OrderBy";
            var resultExpression = System.Linq.Expressions.Expression.Call(
                typeof(System.Linq.Queryable),
                methodName,
                new[] { typeof(T), property.Type },
                query.Expression,
                lambda);

            return query.Provider.CreateQuery<T>(resultExpression);
        }

        public static async Task<(IEnumerable<T> Data, int TotalCount)> ToPagedListAsync<T>(
            this IQueryable<T> query,
            PaginationQuery pagination) where T : class
        {
            var totalCount = await query.CountAsync();
            var data = await query.ApplyPagination(pagination).ToListAsync();
            return (data, totalCount);
        }
    }
}
