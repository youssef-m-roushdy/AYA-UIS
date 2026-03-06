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

            // Fee mappings ✅ (only once, with full config)
            CreateMap<Fee, FeeDto>()
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
                .ReverseMap();
            CreateMap<CreateFeeDto, Fee>();

            // Course mappings
            CreateMap<Course, CourseDto>().ReverseMap();
            CreateMap<Course, CourseWithDepartmentDto>()
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department.Code))
                .ReverseMap();
            CreateMap<CreateCourseDto, Course>();
            CreateMap<Course, DepartmentCourseDto>().ReverseMap();

            // CourseUpload mappings
            CreateMap<CourseUpload, CourseUploadDto>().ReverseMap();
            CreateMap<CreateCourseUploadDto, CourseUpload>();

            // Registration mappings
            CreateMap<Registration, RegistrationCourseDto>();
            CreateMap<Registration, RegistrationDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.Course, opt => opt.MapFrom(src => src.Course))
                .ReverseMap();

            // StudyYear mappings
            CreateMap<StudyYear, StudyYearDto>().ReverseMap();

            // UserStudyYear mappings
            CreateMap<UserStudyYear, UserStudyYearDetailsDto>();

            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                    src.UserRoles != null
                    ? src.UserRoles.Select(ur => ur.Role.Name).ToList()
                    : new List<string>()))
                .ReverseMap();

            CreateMap<User, UserWithDepartmentDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                    src.UserRoles != null
                    ? src.UserRoles.Select(ur => ur.Role.Name).ToList()
                    : new List<string>()))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src =>
                    src.Department != null ? src.Department.Code : null));

            CreateMap<User, StudentUserDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                    src.UserRoles != null
                    ? src.UserRoles.Select(ur => ur.Role.Name).ToList()
                    : new List<string>()))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src =>
                    src.Department != null ? src.Department.Code : null));
        }
    }
}
