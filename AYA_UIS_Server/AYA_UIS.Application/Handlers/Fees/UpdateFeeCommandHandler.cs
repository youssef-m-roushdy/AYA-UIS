using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Commands.Fees;
using AYA_UIS.Domain.Contracts;
using AYA_UIS.Shared.Exceptions;
using MediatR;

namespace AYA_UIS.Application.Handlers.Fees
{
    public class UpdateFeeCommandHandler : IRequestHandler<UpdateFeeCommand, Unit>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateFeeCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(UpdateFeeCommand request, CancellationToken cancellationToken)
        {
            var fee = await _unitOfWork.Fees.GetByIdAsync(request.Id);
            if (fee is null)
                throw new NotFoundException($"Fee with ID {request.Id} not found.");

            fee.Type = request.FeeDto.Type;
            fee.Level = request.FeeDto.Level;
            fee.Description = request.FeeDto.Description;
            fee.Amount = request.FeeDto.Amount;

            await _unitOfWork.Fees.Update(fee);
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
    }
}