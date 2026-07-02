namespace WebPlannerMVC.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public DateTime? EndDate { get; set; }
        public bool Done { get; set; } = false;
        public string? Hashtags { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
    }

    public class SubTask
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool Done { get; set; } = false;

        public int TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }
}