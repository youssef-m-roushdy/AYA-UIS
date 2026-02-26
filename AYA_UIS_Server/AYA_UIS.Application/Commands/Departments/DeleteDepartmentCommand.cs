using MediatR;

namespace AYA_UIS.Application.Commands.Departments
{
    public class DeleteDepartmentCommand : IRequest<Unit>
    {
        public int Id { get; set; }
        public DeleteDepartmentCommand(int id)
        {
            Id = id;
        }
    }
}