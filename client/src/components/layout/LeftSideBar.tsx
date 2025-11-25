import { useState, useContext, useRef } from "react";
import { Home, Search, User, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/CirlceHubLogo.png";
import { AuthContext } from "../../context/AuthContext";
import { useSelector } from "react-redux";
import { type CreateThreadRef } from "../thread/ThreadPost";
import CreateThread from "../thread/ThreadPost";

export default function LeftSidebar() {
  const { pathname } = useLocation();
  const createThreadRef = useRef<CreateThreadRef>(null);

  const authContext = useContext(AuthContext);
  const currentUser = useSelector((state: any) => state.user.currentUser);

  const token = authContext?.token;

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

  const handleThreadCreated = (_newThread: any) => {
    // Since this is in sidebar, we might want to refresh the page or dispatch an event
    window.location.reload(); // Simple solution - refresh to update threads
  };

  const handleCreatePost = () => {
    if (createThreadRef.current) {
      createThreadRef.current.openModal();
    }
  };

  return (
    <aside className="h-screen w-60 p-4 flex flex-col bg-blue-300 text-white
  fixed left-0 top-0 overflow-y-auto">
      <img src={logo} alt="Circle Hub Logo" className=" mb-4 h-20" />

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

      <label
        className="mt-4 cursor-pointer bg-green-500 text-blue-950 hover:bg-white font-semibold text-lg py-1 rounded-2xl text-center "
        onClick={handleCreatePost}
      >
        Create Post
      </label>

      <div className="mt-auto">
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </Button>
      </div>

      {/* Create Thread Modal */}
      {token && (
        <CreateThread
          ref={createThreadRef}
          token={token}
          userAvatar={currentUser?.photo_profile ? `http://localhost:3002/uploads/${currentUser.photo_profile}` : undefined}
          onThreadCreated={handleThreadCreated}
          showBottomDisplay={false}
        />
      )}
    </aside>
  );
}
