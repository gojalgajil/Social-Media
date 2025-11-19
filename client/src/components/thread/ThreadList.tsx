import ThreadCard from "./ThreadCard";

interface Thread {
  id: number;
  content: string;
  image?: string;
  number_of_replies?: number;
  created_at: string;
  likesCount?: number;
  isLiked?: boolean;

  full_name?: string;
  username?: string;
  avatar?: string;
}

export default function ThreadList({
  threads,
  toggleLike
}: {
  threads: Thread[];
  toggleLike?: (threadId: number, hasLiked: boolean) => Promise<void>;
}) {
  return (
    <div className="w-full">
      {threads.map(thread => (
        <ThreadCard key={thread.id} thread={thread} toggleLike={toggleLike} />
      ))}
    </div>
  );
}
