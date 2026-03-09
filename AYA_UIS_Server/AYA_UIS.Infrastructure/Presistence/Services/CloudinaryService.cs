using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using AYA_UIS.Application.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace AYA_UIS.Infrastructure.Presistence.Services;

public class CloudinarySettings
{
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
}

/// <summary>
/// Cloudinary image upload service
/// </summary>
public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private const long MaxFileSizeBytes = 2 * 1024 * 1024; // 2MB
    private const long MaxCourseFileSizeBytes = 10 * 1024 * 1024; // 10MB
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx" };
    private readonly string[] _allowedCourseExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip", ".rar" };

    public CloudinaryService(IOptions<CloudinarySettings> settings)
    {
        var account = new Account(
            settings.Value.CloudName,
            settings.Value.ApiKey,
            settings.Value.ApiSecret
        );

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadUserProfilePictureAsync(IFormFile file, string userId, CancellationToken cancellationToken = default)
    {
        ValidateFile(file);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = "akhbaracademy/profiles",
            PublicId = $"user_{userId}_{Guid.NewGuid()}",
            Transformation = new Transformation()
                .Width(500)
                .Height(500)
                .Crop("fill")
                .Gravity("face")
                .Quality("auto")
                .FetchFormat("auto"),
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (uploadResult.Error != null)
        {
            throw new InvalidOperationException($"Image upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<string> UploadAcademicScheduleAsync(IFormFile file, string scheduleId, CancellationToken cancellationToken = default)
    {
        ValidateFile(file);

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = "akhbaracademy/schedules",
            PublicId = $"schedule_{scheduleId}_{Guid.NewGuid()}",
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (uploadResult.Error != null)
        {
            throw new InvalidOperationException($"Image upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<string> UploadCourseFileAsync(IFormFile file, string fileId, string courseName, CancellationToken cancellationToken = default)
    {
        ValidateCourseFile(file);

        var safeName = courseName.Replace(" ", "_").ToLowerInvariant();
        var folder = $"akhbaracademy/course_uploads/{safeName}";

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var isImage = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }.Contains(extension);

        if (isImage)
        {
            var imageParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, file.OpenReadStream()),
                Folder = folder,
                PublicId = $"course_{fileId}_{Guid.NewGuid()}",
            };

            var imageResult = await _cloudinary.UploadAsync(imageParams, cancellationToken);

            if (imageResult.Error != null)
                throw new InvalidOperationException($"File upload failed: {imageResult.Error.Message}");

            return imageResult.SecureUrl.ToString();
        }

        var rawParams = new RawUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = folder,
            PublicId = $"course_{fileId}_{Guid.NewGuid()}",
        };

        var rawResult = await _cloudinary.UploadLargeAsync(rawParams, cancellationToken: cancellationToken);

        if (rawResult.Error != null)
            throw new InvalidOperationException($"File upload failed: {rawResult.Error.Message}");

        return rawResult.SecureUrl.ToString();
    }

    public async Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(publicId))
            return false;

        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        return result.Result == "ok";
    }
    

    private void ValidateFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }

        if (file.Length > MaxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds the maximum limit of 2MB. Current size: {file.Length / 1024.0 / 1024.0:F2}MB");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");
        }
    }

    private static string ExtractPublicIdFromUrl(string cloudinaryUrl)
    {
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{publicId}.{ext}
        // We need: "{folder}/{publicId}" (without extension)
        var uri = new Uri(cloudinaryUrl);
        var path = uri.AbsolutePath; // e.g. /demo/image/upload/v123456/akhbaracademy/profiles/user_abc_guid.jpg

        // Remove everything up to and including "/upload/"
        var uploadIndex = path.IndexOf("/upload/", StringComparison.Ordinal);
        if (uploadIndex < 0)
            throw new InvalidOperationException($"Invalid Cloudinary URL format: {cloudinaryUrl}");

        var afterUpload = path[(uploadIndex + 8)..]; // "v123456/akhbaracademy/profiles/user_abc_guid.jpg"

        // Strip the version segment (v followed by digits)
        if (afterUpload.StartsWith("v") && afterUpload.Contains("/"))
        {
            var versionEnd = afterUpload.IndexOf('/');
            afterUpload = afterUpload[(versionEnd + 1)..]; // "akhbaracademy/profiles/user_abc_guid.jpg"
        }

        // Remove file extension
        var dotIndex = afterUpload.LastIndexOf('.');
        return dotIndex >= 0 ? afterUpload[..dotIndex] : afterUpload; // "akhbaracademy/profiles/user_abc_guid"
    }

    private void ValidateCourseFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is required");
        }

        if (file.Length > MaxCourseFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds the maximum limit of 10MB. Current size: {file.Length / 1024.0 / 1024.0:F2}MB");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedCourseExtensions.Contains(extension))
        {
            throw new ArgumentException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", _allowedCourseExtensions)}");
        }
    }
}
