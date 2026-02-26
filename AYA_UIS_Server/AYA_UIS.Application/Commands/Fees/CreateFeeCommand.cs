using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using MediatR;
namespace AYA_UIS.Application.Commands.Fees
{
    public class CreateFeeCommand : IRequest<int>
    {
        public CreateFeeDto FeeDto { get; init; }

        public CreateFeeCommand(CreateFeeDto feeDto)
        {
            FeeDto = feeDto;
        }
    }
}