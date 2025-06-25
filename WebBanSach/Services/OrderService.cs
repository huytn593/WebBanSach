using MongoDB.Driver;
using WebBanSach.Models;
using Microsoft.Extensions.Options;

namespace WebBanSach.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orders;

        public OrderService(IOptions<BookStoreDatabaseSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _orders = database.GetCollection<Order>("Orders");
        }

        public List<Order> Get() => _orders.Find(o => true).ToList();
        public List<Order> GetByUserId(string userId) => _orders.Find(o => o.UserId == userId).ToList();
        public void Create(Order order) => _orders.InsertOne(order);
        public double GetTotalRevenue() => _orders.AsQueryable().Sum(o => o.Price);
    }
} 