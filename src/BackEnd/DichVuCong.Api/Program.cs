using DichVuCong.Api.Common.Hosting;

var builder = WebApplication.CreateBuilder(args);
builder.AddApiHosting();
builder.Services.AddApiServices(builder.Configuration);
var app = builder.Build();
app.UseApiPipeline();
app.MapApiEndpoints();
app.Run();

// Cho WebApplicationFactory trong DichVuCong.Tests.
public partial class Program;
