import { MessageCircle, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom';

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

export default function ThreadCard({
  thread,
  toggleLike,
  onReplyClick,
  from = 'home',
}: {
  thread: Thread;
  toggleLike?: (threadId: number, hasLiked: boolean) => Promise<void>;
  onReplyClick?: () => void;
  from?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="border-b border-blue-950 py-2 px-2 flex gap-3">
      <div>
        <img
          src={
            thread.avatar
              ? `http://localhost:3002/uploads/${thread.avatar}`
              : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
          }
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{thread.full_name || "User"}</span>
          <span className="text-xs text-white">@{thread.username || "user"}</span>
          <span className="text-xs text-gray-500">
            • {new Date(thread.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="mt-1 text-black text-sm">{thread.content}</p>

        {thread.image && (
          <img
            src={`http://localhost:3002/uploads/${thread.image}`}
            className="rounded-xl mt-2 max-h-64 object-cover"
          />
        )}

        <div className="flex gap-5 mt-2 text-gray-400">
          <div
            onClick={() => toggleLike?.(thread.id, thread.isLiked ?? false)}
            className={`flex items-center gap-1 cursor-pointer transition hover:text-red-400 text-sm ${
              thread.isLiked ? "text-red-500" : "text-gray-400"
            }`}
          >
            <Heart
              size={16}
              fill={thread.isLiked ? "red" : "none"}
              strokeWidth={thread.isLiked ? 0 : 2}
            />
            <span>{thread.likesCount || 0}</span>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onReplyClick) {
                console.log("ThreadCard using custom onReplyClick");
                onReplyClick();
              } else {
                console.log("ThreadCard navigating to thread:", thread.id);
                navigate(`/thread/${thread.id}`, { state: { from } });
              }
            }}
            className="flex items-center gap-1 hover:text-white cursor-pointer text-sm"
          >
            <MessageCircle size={16} /> {thread.number_of_replies || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
