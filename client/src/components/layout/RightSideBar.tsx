import { ProfileCard } from "./ProfileCard";
import { SuggestedUsers } from "./SuggestedUsers";

export default function RightSidebar() {
  return (
    <aside className="h-screen w-80 p-6 flex flex-col gap-6 bg-blue-300 text-blue-950 fixed right-0 top-0 overflow-y-auto">
      <ProfileCard />
      <SuggestedUsers />
    </aside>
  );
}
