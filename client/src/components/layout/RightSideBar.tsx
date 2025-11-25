import { DevelopedBy } from "./DevelopedBy";
import { ProfileCard } from "./ProfileCard";
import { SuggestedUsers } from "./SuggestedUsers";

export default function RightSidebar() {
  return (
    <aside className="h-screen w-96 p-4 flex flex-col gap-4 bg-blue-300 text-blue-950 fixed right-0 top-0 overflow-y-auto">
      <ProfileCard />
      <SuggestedUsers />
      <DevelopedBy/>
    </aside>
  );
}
