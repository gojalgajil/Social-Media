import ReplyCard from "./ReplyCard";

interface Reply {
  id: number;
  content: string;
  image?: string;
  created_at: string;
  likesCount?: number;
  isLiked?: boolean;
  user?: {
    id: number;
    full_name: string;
    username: string;
    photo_profile?: string;
  };
}

interface ThreadUser {
  id: number;
  full_name?: string;
  username?: string;
  photo_profile?: string;
}

export default function ReplyList({ replies, threadUser }: { replies: Reply[]; threadUser: ThreadUser }) {
  if (replies.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        Belum ada reply. Jadilah yang pertama!
      </div>
    );
  }

  return (
    <div className="w-full">
      {replies.map((reply) => (
        <ReplyCard key={reply.id} reply={reply} threadUser={threadUser} />
      ))}
    </div>
  );
}
