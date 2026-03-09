using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AYA_UIS.Infrastructure.Presistence.Repositories
{
    public class GenericRepository<TEntity, TKey> : IGenericRepository<TEntity, TKey>
        where TEntity : BaseEntities<TKey>
    {
        protected readonly UniversityDbContext _dbContext;

        public GenericRepository(UniversityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Get All
        public async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _dbContext.Set<TEntity>().AsNoTracking().ToListAsync();
        } 

        // Add
        public async Task AddAsync(TEntity entity)
        {
            await _dbContext.Set<TEntity>().AddAsync(entity);
        }

        // Update
        public Task Update(TEntity entity)
        {
            _dbContext.Set<TEntity>().Update(entity);
            return Task.CompletedTask;
        }

        // Delete
        public Task Delete(TEntity entity)
        {
            _dbContext.Set<TEntity>().Remove(entity);
            return Task.CompletedTask;
        }

        // Get By Id
        public async Task<TEntity?> GetByIdAsync(TKey id)
        {
            return await _dbContext.Set<TEntity>().FindAsync(id);
        }
    }
}