using DichVuCong.Api.Features.Chatbot.TimKiem;

namespace DichVuCong.Tests.Api.Chatbot.TimKiem;

public sealed class KhoangCachSuaTests
{
    [Theory]
    [InlineData("sjnh", "sinh", 1)]
    [InlineData("hno", "hon", 1)]
    [InlineData("khaii", "khai", 1)]
    [InlineData("khai", "khai", 0)]
    [InlineData("kha", "khai", 1)]
    [InlineData("khia", "khai", 1)]
    [InlineData("kahi", "khai", 1)]
    [InlineData("khxx", "khai", 2)]
    [InlineData("abc", "xyz", 3)]
    [InlineData("", "ab", 2)]
    [InlineData("ab", "", 2)]
    public void Tinh_ChenXoaThayDao(string a, string b, int mongDoi) => Assert.Equal(mongDoi, KhoangCachSua.Tinh(a, b, 5));

    [Fact]
    public void Tinh_VuotNguongTraNguongCongMot()
    {
        Assert.Equal(2, KhoangCachSua.Tinh("khai", "xyzw", 1));
        Assert.Equal(2, KhoangCachSua.Tinh("abcdefgh", "abcdefghijkl", 1));
        Assert.Equal(3, KhoangCachSua.Tinh("abcdef", "uvwxyz", 2));
    }

    [Theory]
    [InlineData("abcd", "bacd")]
    [InlineData("kitten", "sitting")]
    [InlineData("dang ky", "dnag yk")]
    public void Tinh_DoiXung(string a, string b) => Assert.Equal(KhoangCachSua.Tinh(a, b, 10), KhoangCachSua.Tinh(b, a, 10));
}
