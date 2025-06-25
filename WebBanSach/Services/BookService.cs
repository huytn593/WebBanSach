using MongoDB.Driver;
using WebBanSach.Models;
using Microsoft.Extensions.Options;

namespace WebBanSach.Services
{
    public class BookService
    {
        private readonly IMongoCollection<Book> _books;

        public BookService(IOptions<BookStoreDatabaseSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _books = database.GetCollection<Book>("Books");
        }

        public List<Book> Get() => _books.Find(b => true).ToList();
        public Book? GetById(string id) => _books.Find(b => b.Id == id).FirstOrDefault();
        public void Create(Book book) => _books.InsertOne(book);
        public void Update(string id, Book bookIn) => _books.ReplaceOne(b => b.Id == id, bookIn);
        public void Remove(string id) => _books.DeleteOne(b => b.Id == id);
    }
} 