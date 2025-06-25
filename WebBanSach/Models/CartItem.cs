using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WebBanSach.Models
{
    public class CartItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
    }
} 