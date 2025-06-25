using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WebBanSach.Models
{
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public double Price { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 