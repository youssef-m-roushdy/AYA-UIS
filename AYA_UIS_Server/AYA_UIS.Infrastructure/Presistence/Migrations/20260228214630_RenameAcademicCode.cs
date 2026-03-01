using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AYA_UIS.Infrastructure.Presistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameAcademicCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Academic_Code",
                table: "AspNetUsers",
                newName: "AcademicCode");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_Academic_Code",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_AcademicCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AcademicCode",
                table: "AspNetUsers",
                newName: "Academic_Code");

            migrationBuilder.RenameIndex(
                name: "IX_AspNetUsers_AcademicCode",
                table: "AspNetUsers",
                newName: "IX_AspNetUsers_Academic_Code");
        }
    }
}
