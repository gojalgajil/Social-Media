import { Heart } from "lucide-react";

interface ThreadUser {
  id: number;
  full_name?: string;
  username?: string;
  photo_profile?: string;
}

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

export default function ReplyCard({
  reply,
  threadUser,
  toggleLike,
}: {
  reply: Reply;
  threadUser: ThreadUser;
  toggleLike: (threadId: number, hasLiked: boolean) => Promise<void>;
}) {
  return (
    <div className="border-b border-blue-950 py-4 px-2 flex gap-4">
      <div>
        <img
  src={reply.user?.photo_profile
    ? `http://localhost:3002/uploads/${reply.user.photo_profile}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
  }
  className="h-8 w-8 rounded-full object-cover"
  alt="profile"
/>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {reply.user?.full_name}
          </span>
          <span className="text-sm text-white">
            @{reply.user?.username}
          </span>
          <span className="text-xs text-gray-500">
            • {new Date(reply.created_at).toLocaleDateString()}
          </span>
        </div>


        <p className="mt-1 text-black">{reply.content}</p>

        {reply.image && (
          <img
            src={`http://localhost:3002/uploads/${reply.image}`}
            className="rounded-xl mt-3 max-h-96 object-cover"
          />
        )}

        <div className="flex gap-6 mt-3 text-gray-400">
          <div
            className={`flex items-center gap-2 cursor-pointer transition hover:text-red-400 ${
              reply.isLiked ? "text-red-500" : "text-gray-400"
            }`}
            onClick={() => toggleLike(reply.id, reply.isLiked || false)}
          >
            <Heart
              size={18}
              fill={reply.isLiked ? "red" : "none"}
              strokeWidth={reply.isLiked ? 0 : 2}
            />
            <span>{reply.likesCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
