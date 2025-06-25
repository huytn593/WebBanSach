using MongoDB.Driver;
using WebBanSach.Models;
using Microsoft.Extensions.Options;

namespace WebBanSach.Services
{
    public class CartService
    {
        private readonly IMongoCollection<CartItem> _cartItems;

        public CartService(IOptions<BookStoreDatabaseSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _cartItems = database.GetCollection<CartItem>("CartItems");
        }

        public List<CartItem> GetByUserId(string userId) => _cartItems.Find(c => c.UserId == userId).ToList();
        public CartItem? GetByUserAndBook(string userId, string bookId) => _cartItems.Find(c => c.UserId == userId && c.BookId == bookId).FirstOrDefault();
        public void AddOrUpdate(string userId, string bookId, int quantity)
        {
            var item = GetByUserAndBook(userId, bookId);
            if (item == null)
            {
                _cartItems.InsertOne(new CartItem { UserId = userId, BookId = bookId, Quantity = quantity });
            }
            else
            {
                item.Quantity += quantity;
                _cartItems.ReplaceOne(c => c.Id == item.Id, item);
            }
        }
        public void UpdateQuantity(string userId, string bookId, int quantity)
        {
            var item = GetByUserAndBook(userId, bookId);
            if (item != null)
            {
                item.Quantity = quantity;
                _cartItems.ReplaceOne(c => c.Id == item.Id, item);
            }
        }
        public void Remove(string userId, string bookId)
        {
            _cartItems.DeleteOne(c => c.UserId == userId && c.BookId == bookId);
        }
        public void Clear(string userId)
        {
            _cartItems.DeleteMany(c => c.UserId == userId);
        }
    }
} 