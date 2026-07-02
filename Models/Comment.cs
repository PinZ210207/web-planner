namespace WebPlannerMVC.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }
}