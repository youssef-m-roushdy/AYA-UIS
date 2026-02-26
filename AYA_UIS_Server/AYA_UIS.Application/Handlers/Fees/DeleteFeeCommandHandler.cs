using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.Fees;
using AYA_UIS.Domain.Contracts;
using MediatR;

namespace AYA_UIS.Application.Handlers.Fees
{
    public class DeleteFeeCommandHandler : IRequestHandler<DeleteFeeCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteFeeCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(DeleteFeeCommand request, CancellationToken cancellationToken)
        {
            var fee = await _unitOfWork.Fees.GetByIdAsync(request.Id);
            if (fee is null)
                return Unit.Value; // If fee not found, we can consider it as already deleted and return success.

            await _unitOfWork.Fees.Delete(fee);
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
    }
}