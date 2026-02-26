using AYA_UIS.Domain.Enums;

namespace AYA_UIS.Application.Dtos.DepartmentDtos.FeeDtos
{
    public record FeeDto
    {
        public int Id { get; set; }
        public FeeType Type { get; set; }
        public Levels Level { get; set; }
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public int DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int StudyYearId { get; set; }
    }
}