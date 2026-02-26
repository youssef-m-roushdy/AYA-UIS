using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.RegistrationDtos;
using MediatR;
using Shared.Respones;

namespace AYA_UIS.Application.Commands.Registrations
{
    public class UpdateRegistrationCommand : IRequest<Unit>
    {
        public int RegistrationId { get; set; }
        public UpdateRegistrationDto UpdateDto { get; set; } = null!;

        public UpdateRegistrationCommand(int registrationId, UpdateRegistrationDto updateDto)
        {
            RegistrationId = registrationId;
            UpdateDto = updateDto;
        }
    }
}