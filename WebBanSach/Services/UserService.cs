using MongoDB.Driver;
using WebBanSach.Models;
using Microsoft.Extensions.Options;

namespace WebBanSach.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<BookStoreDatabaseSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<User>("Users");
        }

        public List<User> Get() => _users.Find(u => true).ToList();
        public User? GetById(string id) => _users.Find(u => u.Id == id).FirstOrDefault();
        public User? GetByUsername(string username) => _users.Find(u => u.Username == username).FirstOrDefault();
        public void Create(User user) => _users.InsertOne(user);
        public void Update(string id, User userIn) => _users.ReplaceOne(u => u.Id == id, userIn);
        public void Remove(string id) => _users.DeleteOne(u => u.Id == id);
    }
} 