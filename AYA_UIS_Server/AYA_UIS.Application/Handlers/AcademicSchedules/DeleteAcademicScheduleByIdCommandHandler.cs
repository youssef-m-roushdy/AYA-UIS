using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.AcademicSchedules;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.AcademicSchedules
{
    public class DeleteAcademicScheduleByIdCommandHandler : IRequestHandler<DeleteAcademicScheduleByIdCommand, bool>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteAcademicScheduleByIdCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(DeleteAcademicScheduleByIdCommand request, CancellationToken cancellationToken)
        {
            var schedule = await _unitOfWork.AcademicSchedules.GetByIdAsync(request.Id);

            if (schedule is null)
                return false;

            await _unitOfWork.AcademicSchedules.Delete(schedule);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}