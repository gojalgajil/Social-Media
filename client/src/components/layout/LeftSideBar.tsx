import { Home, Search, User, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/CirlceHubLogo.png";

export default function LeftSidebar() {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Follows", icon: Users, href: "/follows" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <aside className="h-screen w-64 border-l p-6 flex flex-col gap-6 bg-blue-300 text-white 
  fixed left-0 top-0 overflow-y-auto">
      <img src={logo} alt="Circle Hub Logo" className=" mb-4 h-25" />

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition hover:bg-blue-900 ${
                active ? "bg-blue-700" : ""
              }`}
            >
              <Icon size={20} />
              <span className="text-lg">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </aside>
  );
}
