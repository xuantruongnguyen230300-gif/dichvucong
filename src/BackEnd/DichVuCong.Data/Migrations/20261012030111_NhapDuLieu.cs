using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DichVuCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class NhapDuLieu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cau_chua_tra_loi",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    noi_dung = table.Column<string>(type: "text", nullable: false),
                    khoa_gop = table.Column<string>(type: "text", nullable: false),
                    so_lan_gap = table.Column<int>(type: "integer", nullable: false),
                    lan_gap_cuoi = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cau_chua_tra_loi", x => x.id);
                    table.CheckConstraint("ck_cau_chua_tra_loi_noi_dung", "char_length(noi_dung) <= 500");
                    table.CheckConstraint("ck_cau_chua_tra_loi_so_lan_gap", "so_lan_gap >= 1");
                });

            migrationBuilder.CreateTable(
                name: "cau_hoi_mau",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    cau_hoi = table.Column<string>(type: "text", nullable: false),
                    tra_loi = table.Column<string>(type: "text", nullable: true),
                    muc_trung_tam = table.Column<short>(type: "smallint", nullable: true),
                    ma_thu_tuc = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cau_hoi_mau", x => x.thu_tu);
                    table.CheckConstraint("ck_cau_hoi_mau_muc_trung_tam", "muc_trung_tam BETWEEN 1 AND 5");
                    table.CheckConstraint("ck_cau_hoi_mau_tra_loi_hoac_muc", "(tra_loi IS NULL) <> (muc_trung_tam IS NULL)");
                });

            migrationBuilder.CreateTable(
                name: "chu_de_goi_y",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    ten_hien_thi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ten_linh_vuc = table.Column<string>(type: "text", nullable: false),
                    linh_vuc_ma = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chu_de_goi_y", x => x.thu_tu);
                });

            migrationBuilder.CreateTable(
                name: "gio_lam_viec",
                columns: table => new
                {
                    thu = table.Column<short>(type: "smallint", nullable: false),
                    sang_tu = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    sang_den = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    chieu_tu = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    chieu_den = table.Column<TimeOnly>(type: "time without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gio_lam_viec", x => x.thu);
                    table.CheckConstraint("ck_gio_lam_viec_cap_chieu", "(chieu_tu IS NULL) = (chieu_den IS NULL)");
                    table.CheckConstraint("ck_gio_lam_viec_cap_sang", "(sang_tu IS NULL) = (sang_den IS NULL)");
                    table.CheckConstraint("ck_gio_lam_viec_co_buoi", "sang_tu IS NOT NULL OR chieu_tu IS NOT NULL");
                    table.CheckConstraint("ck_gio_lam_viec_thu", "thu BETWEEN 1 AND 7");
                    table.CheckConstraint("ck_gio_lam_viec_thu_tu_chieu", "chieu_tu IS NULL OR chieu_tu < chieu_den");
                    table.CheckConstraint("ck_gio_lam_viec_thu_tu_sang", "sang_tu IS NULL OR sang_tu < sang_den");
                });

            migrationBuilder.CreateTable(
                name: "lan_nhap",
                columns: table => new
                {
                    loai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    thoi_diem = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ten_file = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lan_nhap", x => x.loai);
                    table.CheckConstraint("ck_lan_nhap_loai", "loai IN ('thu-tuc', 'phan-cong', 'trung-tam', 'tro-ly')");
                });

            migrationBuilder.CreateTable(
                name: "lien_ket",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    ten = table.Column<string>(type: "text", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lien_ket", x => x.thu_tu);
                });

            migrationBuilder.CreateTable(
                name: "linh_vuc",
                columns: table => new
                {
                    ma = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ten = table.Column<string>(type: "text", nullable: false),
                    ten_tim_kiem = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_linh_vuc", x => x.ma);
                });

            migrationBuilder.CreateTable(
                name: "nhan_su",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    ho_ten = table.Column<string>(type: "text", nullable: false),
                    xung_ho = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    chuc_vu = table.Column<string>(type: "text", nullable: true),
                    quay = table.Column<int>(type: "integer", nullable: true),
                    mo_ta = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nhan_su", x => x.thu_tu);
                    table.CheckConstraint("ck_nhan_su_quay", "quay > 0");
                });

            migrationBuilder.CreateTable(
                name: "o_dich_vu",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    ten = table.Column<string>(type: "text", nullable: false),
                    mo_ta = table.Column<string>(type: "text", nullable: true),
                    bieu_tuong = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_o_dich_vu", x => x.thu_tu);
                });

            migrationBuilder.CreateTable(
                name: "phan_cong_linh_vuc",
                columns: table => new
                {
                    linh_vuc_ma = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ten_linh_vuc = table.Column<string>(type: "text", nullable: false),
                    quay = table.Column<int>(type: "integer", nullable: true),
                    noi_tiep_nhan_chuyen = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_phan_cong_linh_vuc", x => x.linh_vuc_ma);
                    table.CheckConstraint("ck_phan_cong_linh_vuc_quay", "quay > 0");
                });

            migrationBuilder.CreateTable(
                name: "trung_tam",
                columns: table => new
                {
                    id = table.Column<short>(type: "smallint", nullable: false),
                    ten = table.Column<string>(type: "text", nullable: false),
                    nguoi_chiu_trach_nhiem = table.Column<string>(type: "text", nullable: false),
                    chuc_vu_nguoi_chiu_trach_nhiem = table.Column<string>(type: "text", nullable: true),
                    co_quan_chu_quan = table.Column<string>(type: "text", nullable: true),
                    dia_chi = table.Column<string>(type: "text", nullable: false),
                    dien_thoai = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    xa = table.Column<string>(type: "text", nullable: true),
                    tinh = table.Column<string>(type: "text", nullable: true),
                    ma_don_vi_cong_dvc = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    ban_do = table.Column<string>(type: "text", nullable: true),
                    zalo_oa = table.Column<string>(type: "text", nullable: true),
                    facebook = table.Column<string>(type: "text", nullable: true),
                    you_tube = table.Column<string>(type: "text", nullable: true),
                    tik_tok = table.Column<string>(type: "text", nullable: true),
                    ghi_chu_ngay_nghi = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trung_tam", x => x.id);
                    table.CheckConstraint("ck_trung_tam_mot_dong", "id = 1");
                });

            migrationBuilder.CreateTable(
                name: "tu_dong_nghia",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    tu = table.Column<string>(type: "text", nullable: false),
                    tu_tim_kiem = table.Column<string>(type: "text", nullable: false),
                    cach_noi_khac = table.Column<string[]>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tu_dong_nghia", x => x.thu_tu);
                });

            migrationBuilder.CreateTable(
                name: "viet_tat",
                columns: table => new
                {
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    chu_viet_tat = table.Column<string>(type: "text", nullable: false),
                    chu_viet_tat_tim_kiem = table.Column<string>(type: "text", nullable: false),
                    day_du = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_viet_tat", x => x.thu_tu);
                });

            migrationBuilder.CreateTable(
                name: "cau_hoi_mau_cach_hoi",
                columns: table => new
                {
                    cau_hoi_mau_thu_tu = table.Column<int>(type: "integer", nullable: false),
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    noi_dung = table.Column<string>(type: "text", nullable: false),
                    noi_dung_tim_kiem = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cau_hoi_mau_cach_hoi", x => new { x.cau_hoi_mau_thu_tu, x.thu_tu });
                    table.ForeignKey(
                        name: "fk_cau_hoi_mau_cach_hoi_cau_hoi_mau_cau_hoi_mau_thu_tu",
                        column: x => x.cau_hoi_mau_thu_tu,
                        principalTable: "cau_hoi_mau",
                        principalColumn: "thu_tu",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "thu_tuc",
                columns: table => new
                {
                    ma = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ten = table.Column<string>(type: "text", nullable: false),
                    ten_tim_kiem = table.Column<string>(type: "text", nullable: false),
                    linh_vuc_ma = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    thuoc_danh_muc_xa = table.Column<bool>(type: "boolean", nullable: false),
                    thuoc_danh_muc_tinh = table.Column<bool>(type: "boolean", nullable: false),
                    muc_do = table.Column<short>(type: "smallint", nullable: false),
                    co_quan_thuc_hien = table.Column<string>(type: "text", nullable: true),
                    yeu_cau_dieu_kien = table.Column<string>(type: "text", nullable: true),
                    trang_thai_cong_bo = table.Column<string>(type: "text", nullable: true),
                    thoi_han = table.Column<string>(type: "text", nullable: true),
                    phi = table.Column<string>(type: "text", nullable: true),
                    hinh_thuc_nop = table.Column<string[]>(type: "text[]", nullable: false),
                    ma_dvc = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    don_vi_ten = table.Column<string>(type: "text", nullable: true),
                    don_vi_ma = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    thu_tu = table.Column<int>(type: "integer", nullable: false),
                    thu_tu_thuong_gap = table.Column<int>(type: "integer", nullable: true),
                    ket_qua = table.Column<string[]>(type: "text[]", nullable: false),
                    cach_thuc = table.Column<string>(type: "jsonb", nullable: false),
                    can_cu = table.Column<string>(type: "jsonb", nullable: false),
                    thanh_phan_ho_so = table.Column<string>(type: "jsonb", nullable: false),
                    trinh_tu = table.Column<string>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_thu_tuc", x => x.ma);
                    table.CheckConstraint("ck_thu_tuc_danh_muc", "thuoc_danh_muc_xa OR thuoc_danh_muc_tinh");
                    table.CheckConstraint("ck_thu_tuc_muc_do", "muc_do IN (1, 2)");
                    table.CheckConstraint("ck_thu_tuc_thu_tu_thuong_gap", "thu_tu_thuong_gap > 0");
                    table.ForeignKey(
                        name: "fk_thu_tuc_linh_vuc_linh_vuc_ma",
                        column: x => x.linh_vuc_ma,
                        principalTable: "linh_vuc",
                        principalColumn: "ma",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_cau_chua_tra_loi_khoa_gop",
                table: "cau_chua_tra_loi",
                column: "khoa_gop",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_cau_chua_tra_loi_lan_gap_cuoi",
                table: "cau_chua_tra_loi",
                column: "lan_gap_cuoi");

            migrationBuilder.CreateIndex(
                name: "ix_cau_hoi_mau_cach_hoi_noi_dung_tim_kiem",
                table: "cau_hoi_mau_cach_hoi",
                column: "noi_dung_tim_kiem")
                .Annotation("Npgsql:IndexMethod", "gin")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_linh_vuc_ten_tim_kiem",
                table: "linh_vuc",
                column: "ten_tim_kiem")
                .Annotation("Npgsql:IndexMethod", "gin")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_thu_tuc_linh_vuc_ma",
                table: "thu_tuc",
                column: "linh_vuc_ma");

            migrationBuilder.CreateIndex(
                name: "ix_thu_tuc_ten_tim_kiem",
                table: "thu_tuc",
                column: "ten_tim_kiem")
                .Annotation("Npgsql:IndexMethod", "gin")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "ix_thu_tuc_thu_tu_thuong_gap",
                table: "thu_tuc",
                column: "thu_tu_thuong_gap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_tu_dong_nghia_tu_tim_kiem",
                table: "tu_dong_nghia",
                column: "tu_tim_kiem",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_viet_tat_chu_viet_tat_tim_kiem",
                table: "viet_tat",
                column: "chu_viet_tat_tim_kiem",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cau_chua_tra_loi");

            migrationBuilder.DropTable(
                name: "cau_hoi_mau_cach_hoi");

            migrationBuilder.DropTable(
                name: "chu_de_goi_y");

            migrationBuilder.DropTable(
                name: "gio_lam_viec");

            migrationBuilder.DropTable(
                name: "lan_nhap");

            migrationBuilder.DropTable(
                name: "lien_ket");

            migrationBuilder.DropTable(
                name: "nhan_su");

            migrationBuilder.DropTable(
                name: "o_dich_vu");

            migrationBuilder.DropTable(
                name: "phan_cong_linh_vuc");

            migrationBuilder.DropTable(
                name: "thu_tuc");

            migrationBuilder.DropTable(
                name: "trung_tam");

            migrationBuilder.DropTable(
                name: "tu_dong_nghia");

            migrationBuilder.DropTable(
                name: "viet_tat");

            migrationBuilder.DropTable(
                name: "cau_hoi_mau");

            migrationBuilder.DropTable(
                name: "linh_vuc");
        }
    }
}
