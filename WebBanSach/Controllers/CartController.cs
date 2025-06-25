using Microsoft.AspNetCore.Mvc;
using WebBanSach.Models;
using WebBanSach.Services;

namespace WebBanSach.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;
        private readonly BookService _bookService;
        private readonly OrderService _orderService;
        private readonly UserService _userService;
        public CartController(CartService cartService, BookService bookService, OrderService orderService, UserService userService)
        {
            _cartService = cartService;
            _bookService = bookService;
            _orderService = orderService;
            _userService = userService;
        }

        [HttpGet]
        public IActionResult GetCart([FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null) return Unauthorized();
            var cart = _cartService.GetByUserId(userId);
            return Ok(cart);
        }

        [HttpPost("add")]
        public IActionResult AddToCart([FromQuery] string userId, [FromQuery] string bookId, [FromQuery] int quantity = 1)
        {
            var user = _userService.GetById(userId);
            var book = _bookService.GetById(bookId);
            if (user == null || book == null) return BadRequest();
            _cartService.AddOrUpdate(userId, bookId, quantity);
            return Ok();
        }

        [HttpPut("update")]
        public IActionResult UpdateQuantity([FromQuery] string userId, [FromQuery] string bookId, [FromQuery] int quantity)
        {
            var user = _userService.GetById(userId);
            if (user == null) return Unauthorized();
            _cartService.UpdateQuantity(userId, bookId, quantity);
            return Ok();
        }

        [HttpDelete("remove")]
        public IActionResult RemoveFromCart([FromQuery] string userId, [FromQuery] string bookId)
        {
            var user = _userService.GetById(userId);
            if (user == null) return Unauthorized();
            _cartService.Remove(userId, bookId);
            return Ok();
        }

        [HttpDelete("clear")]
        public IActionResult ClearCart([FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null) return Unauthorized();
            _cartService.Clear(userId);
            return Ok();
        }

        [HttpPost("checkout")]
        public IActionResult Checkout([FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null) return Unauthorized();
            var cart = _cartService.GetByUserId(userId);
            foreach (var item in cart)
            {
                var book = _bookService.GetById(item.BookId);
                if (book != null)
                {
                    for (int i = 0; i < item.Quantity; i++)
                    {
                        var order = new Order { UserId = userId, BookId = book.Id, Price = book.Price, CreatedAt = DateTime.UtcNow };
                        _orderService.Create(order);
                    }
                }
            }
            _cartService.Clear(userId);
            return Ok();
        }
    }
} 