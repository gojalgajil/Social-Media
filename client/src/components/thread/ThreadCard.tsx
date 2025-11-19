import { MessageCircle, Heart } from "lucide-react";

interface Thread {
  id: number;
  content: string;
  image?: string;
  number_of_replies?: number;
  created_at: string;
  likesCount?: number;
  isLiked?: boolean;

  //untuk info usernya
  full_name?: string;
  username?: string;
  avatar?: string;
}

export default function ThreadCard({
  thread,
  toggleLike
}: {
  thread: Thread;
  toggleLike?: (threadId: number, hasLiked: boolean) => Promise<void>;
}) {

  return (
    <div className="border-b border-blue-950 py-4 px-2 flex gap-4">

      {/* Avatar */}
      <div>
        <img
          src={thread.avatar || "https://via.placeholder.com/40"}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{thread.full_name || "Anonymous"}</span>
          <span className="text-xs text-white">@{thread.username || "user"}</span>
          <span className="text-xs text-gray-500">• {new Date(thread.created_at).toLocaleDateString()}</span>
        </div>

        <p className="mt-1 text-sm text-black">{thread.content}</p>

        {thread.image && (
          <img
            src={`http://localhost:3000/uploads/${thread.image}`}
            className="rounded-xl mt-3 max-h-96 object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex gap-6 mt-3 text-gray-400">

          {/* Like Button */}
          <div
             onClick={() => toggleLike?.(thread.id, thread.isLiked ?? false)}
             className={`
             flex items-center gap-2 cursor-pointer transition
            hover:text-red-400
             ${thread.isLiked ? "text-red-500" : "text-gray-400"}
             `}
>
          <Heart
            size={18}
            fill={thread.isLiked ? "red" : "none"}
            strokeWidth={thread.isLiked ? 0 : 2}
          />
          <span>{thread.likesCount || 0}</span>
        </div>

          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            <MessageCircle size={18} /> {thread.number_of_replies || 0}
          </div>

        </div>
      </div>

    </div>
  );
}
