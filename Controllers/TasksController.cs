using Microsoft.AspNetCore.Mvc;

namespace WebPlannerMVC.Controllers
{
    public class TasksController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Add()
        {
            return View();
        }
    }
}