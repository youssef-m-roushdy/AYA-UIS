using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace AYA_UIS.Application.Dtos.UserDtos
{
    public class UpdateProfilePictureDto
    {
        public IFormFile ProfilePicture { get; set; }
    }
}