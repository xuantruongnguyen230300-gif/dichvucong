using Microsoft.EntityFrameworkCore;

namespace DichVuCong.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
}
