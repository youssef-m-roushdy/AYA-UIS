using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AYA_UIS.Application.Dtos.AcademicSheduleDtos;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AYA_UIS.Application.Commands.AcademicSchedules
{
    public class CreateSemesterAcademicScheduleCommand : IRequest<Unit>
    {
        public string UploadedByUserId { get; set; }
        public int StudyYearId { get; set; }
        public int DepartmentId { get; set; }
        public int SemesterId { get; set; }
        public CreateSemesterAcademicScheduleDto CreateAcademicScheduleDto { get; set; }
        public CreateSemesterAcademicScheduleCommand(
            string uploadedByUserId,
            int studyYearId,
            int departmentId,
            int semesterId,
            CreateSemesterAcademicScheduleDto createAcademicScheduleDto)
        {
            UploadedByUserId = uploadedByUserId;
            StudyYearId = studyYearId;
            DepartmentId = departmentId;
            SemesterId = semesterId;
            CreateAcademicScheduleDto = createAcademicScheduleDto;
        }
    }
}