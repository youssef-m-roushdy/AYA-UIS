using AutoMapper;
using AYA_UIS.Application.Dtos.AcademicSheduleDtos;
using AYA_UIS.Application.Dtos.CourseDtos;
using AYA_UIS.Application.Dtos.CourseUploadDtos;
using AYA_UIS.Application.Dtos.DepartmentDtos;
using AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos;
using AYA_UIS.Application.Dtos.RegistrationDtos;
using AYA_UIS.Application.Dtos.StudyYearDtos;
using AYA_UIS.Application.Dtos.UserDtos;
using AYA_UIS.Application.Dtos.UserStudyYearDtos;
using AYA_UIS.Domain.Entities.Identity;
using AYA_UIS.Domain.Entities.Models;


namespace AYA_UIS.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Department mappings
            CreateMap<Department, DepartmentDto>().ReverseMap();
            CreateMap<Department, DepartmentDetailsDto>().ReverseMap();
            CreateMap<CreateDepartmentDto, Department>();
            CreateMap<UpdateDepartmentDto, Department>();

            // AcademicSchedule mappings
            CreateMap<AcademicSchedule, AcademicSchedulesDto>().ReverseMap();
            CreateMap<CreateSemesterAcademicScheduleDto, AcademicSchedule>();

            // DepartmentFee mappings

            // Fee mappings
            CreateMap<Fee, FeeDto>().ReverseMap();

            //Course mappings
            CreateMap<Course, CourseDto>().ReverseMap();
            CreateMap<CreateCourseDto, Course>();
            //CreateMap<UpdateCourseDto, Course>();

            //CourseUpload mappings
            CreateMap<CourseUpload, CourseUploadDto>().ReverseMap();
            CreateMap<CreateCourseUploadDto, CourseUpload>();

            //Registration mappings
            CreateMap<Registration, RegistrationCourseDto>();

            // Fee mappings
            CreateMap<Fee, FeeDto>()
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
                .ReverseMap();
            CreateMap<CreateFeeDto, Fee>();

            // map study year to study year dto
            CreateMap<StudyYear, StudyYearDto>().ReverseMap();

            //user study year to user study year dto
            CreateMap<UserStudyYear, UserStudyYearDetailsDto>();

            //user mapping
            CreateMap<User, UserDto>().ForMember(dest => dest.Roles, opt => opt.MapFrom(src => 
            src.UserRoles != null 
            ? src.UserRoles.Select(ur => ur.Role.Name).ToList() 
            : new List<string>()));;
            
        }
    }
}
