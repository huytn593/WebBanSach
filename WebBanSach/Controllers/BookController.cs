using Microsoft.AspNetCore.Mvc;
using WebBanSach.Models;
using WebBanSach.Services;
using Microsoft.AspNetCore.Http;
using System.IO;
using System;

namespace WebBanSach.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly BookService _bookService;
        private readonly UserService _userService;
        public BookController(BookService bookService, UserService userService)
        {
            _bookService = bookService;
            _userService = userService;
        }

        [HttpGet]
        public IActionResult GetAll() => Ok(_bookService.Get());

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var book = _bookService.GetById(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Book book, [FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null || user.Role != "admin") return Unauthorized();
            _bookService.Create(book);
            return Ok(book);
        }

        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Book book, [FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null || user.Role != "admin") return Unauthorized();
            var existing = _bookService.GetById(id);
            if (existing == null) return NotFound();
            book.Id = id;
            _bookService.Update(id, book);
            return Ok(book);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id, [FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null || user.Role != "admin") return Unauthorized();
            var existing = _bookService.GetById(id);
            if (existing == null) return NotFound();
            _bookService.Remove(id);
            return Ok();
        }

        [HttpPost("upload-cover")]
        public IActionResult UploadCover([FromForm] IFormFile file, [FromQuery] string userId)
        {
            var user = _userService.GetById(userId);
            if (user == null || user.Role != "admin") return Unauthorized();
            if (file == null || file.Length == 0) return BadRequest("No file uploaded");
            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var savePath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "bookCover", fileName);
            using (var stream = new FileStream(savePath, FileMode.Create))
            {
                file.CopyTo(stream);
            }
            var url = $"/storage/bookCover/{fileName}";
            return Ok(new { url });
        }
    }
} 