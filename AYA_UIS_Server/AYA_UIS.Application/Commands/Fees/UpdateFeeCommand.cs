using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using MediatR;

namespace AYA_UIS.Application.Commands.Fees
{
    public class UpdateFeeCommand : IRequest<Unit>
    {
        public int Id { get; set; }
        public UpdateFeeDto FeeDto { get; set; }

        public UpdateFeeCommand(int id, UpdateFeeDto feeDto)
        {
            Id = id;
            FeeDto = feeDto;
        }
    }
}