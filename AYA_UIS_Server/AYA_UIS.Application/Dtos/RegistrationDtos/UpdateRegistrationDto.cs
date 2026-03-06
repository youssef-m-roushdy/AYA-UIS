using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.RegistrationDtos
{
    public class UpdateRegistrationDto
    {
        public RegistrationStatus Status { get; set; }
        public string? Reason { get; set; } 
        public Grads? Grade { get; set; }
    }
}