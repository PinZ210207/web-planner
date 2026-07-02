using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebPlannerMVC.Data;
using WebPlannerMVC.Models;

namespace WebPlannerMVC.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    public class TasksApiController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TasksApiController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] int userId, [FromQuery] string? view, [FromQuery] string? priority)
        {
            var query = _db.Tasks
                .Include(t => t.Comments)
                .Include(t => t.SubTasks)
                .Where(t => t.UserId == userId);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(t => t.Priority == priority);

            var now = DateTime.UtcNow;

            if (view == "day")
                query = query.Where(t => t.EndDate.HasValue && t.EndDate.Value.Date == now.Date);
            else if (view == "week")
                query = query.Where(t => t.EndDate.HasValue && t.EndDate.Value >= now && t.EndDate.Value <= now.AddDays(7));
            else if (view == "month")
                query = query.Where(t => t.EndDate.HasValue && t.EndDate.Value.Month == now.Month && t.EndDate.Value.Year == now.Year);
            else if (view == "year")
                query = query.Where(t => t.EndDate.HasValue && t.EndDate.Value.Year == now.Year);

            var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

            return Ok(tasks.Select(t => new
            {
                t.Id,
                t.Title,
                t.Description,
                t.Priority,
                t.EndDate,
                t.Done,
                hashtags = t.Hashtags != null ? t.Hashtags.Split(',', StringSplitOptions.RemoveEmptyEntries) : Array.Empty<string>(),
                subtasks = t.SubTasks.Select(s => new { s.Id, s.Text, s.Done }),
                comments = t.Comments.Select(c => new { c.Id, c.Text, c.Author, c.CreatedAt }),
                t.CreatedAt
            }));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                EndDate = dto.EndDate,
                Hashtags = dto.Hashtags != null ? string.Join(",", dto.Hashtags) : null,
                UserId = dto.UserId,
                SubTasks = dto.SubTasks?.Select(s => new SubTask { Text = s, Done = false }).ToList() ?? new List<SubTask>()
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            return Ok(new { task.Id, message = "Task created." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskDto dto)
        {
            var task = await _db.Tasks.Include(t => t.SubTasks).FirstOrDefaultAsync(t => t.Id == id);
            if (task == null) return NotFound(new { message = "Task not found." });

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Priority = dto.Priority;
            task.EndDate = dto.EndDate;
            task.Done = dto.Done;
            task.Hashtags = dto.Hashtags != null ? string.Join(",", dto.Hashtags) : null;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Task updated." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return NotFound(new { message = "Task not found." });

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Task deleted." });
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto dto)
        {
            var task = await _db.Tasks.FindAsync(id);
            if (task == null) return NotFound(new { message = "Task not found." });

            var comment = new Comment
            {
                Text = dto.Text,
                Author = dto.Author,
                TaskItemId = id
            };

            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();

            return Ok(new { comment.Id, message = "Comment added." });
        }
    }

    public record TaskDto(string Title, string? Description, string? Priority, DateTime? EndDate, bool Done, int UserId, string[]? Hashtags, string[]? SubTasks);
    public record CommentDto(string Text, string Author);
}