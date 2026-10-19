namespace DichVuCong.Api.Features.Chatbot.DocCauTraLoi;

/// <summary>Một chữ viết tắt và dạng đầy đủ để máy đọc (F07 BR-3). Không có thứ tự và dạng bỏ dấu: chỉ trường FE cần.</summary>
public sealed record VietTatDocDto(string ChuVietTat, string DayDu);
