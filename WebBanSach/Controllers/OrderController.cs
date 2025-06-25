using Microsoft.AspNetCore.Mvc;
using WebBanSach.Models;
using WebBanSach.Services;

namespace WebBanSach.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly BookService _bookService;
        private readonly UserService _userService;
        public OrderController(OrderService orderService, BookService bookService, UserService userService)
        {
            _orderService = orderService;
            _bookService = bookService;
            _userService = userService;
        }

        [HttpPost("buy")] // userId, bookId
        public IActionResult Buy([FromQuery] string userId, [FromQuery] string bookId)
        {
            var user = _userService.GetById(userId);
            var book = _bookService.GetById(bookId);
            if (user == null || book == null) return BadRequest();
            var order = new Order { UserId = userId, BookId = bookId, Price = book.Price, CreatedAt = DateTime.UtcNow };
            _orderService.Create(order);
            return Ok(order);
        }

        [HttpGet("revenue")]
        public IActionResult GetRevenue([FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null || user.Role != "admin") return Unauthorized();
            var total = _orderService.GetTotalRevenue();
            return Ok(new { revenue = total });
        }

        [HttpGet("history")]
        public IActionResult GetHistory([FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null) return Unauthorized();
            var orders = _orderService.GetByUserId(userId);
            return Ok(orders);
        }
    }
} 