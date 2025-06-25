using Microsoft.AspNetCore.Mvc;
using WebBanSach.Models;
using WebBanSach.Services;
using System.Security.Cryptography;
using System.Text;

namespace WebBanSach.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        public AuthController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            if (user.Role == "admin")
                return BadRequest("Không thể đăng ký admin!");
            if (_userService.GetByUsername(user.Username) != null)
                return BadRequest("Username đã tồn tại!");
            user.Password = HashPassword(user.Password);
            _userService.Create(user);
            return Ok(new { message = "Đăng ký thành công!" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User login)
        {
            var user = _userService.GetByUsername(login.Username);
            if (user == null || user.Password != HashPassword(login.Password))
                return Unauthorized("Sai tài khoản hoặc mật khẩu!");
            return Ok(new { user.Id, user.Username, user.Role });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
} 