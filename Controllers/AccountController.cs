using Microsoft.AspNetCore.Mvc;

namespace WebPlannerMVC.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult Login() => View();
        public IActionResult Signup() => View();
        public IActionResult Profile() => View();
    }
}