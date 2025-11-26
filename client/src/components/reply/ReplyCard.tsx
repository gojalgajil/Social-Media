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

import { useNavigate } from 'react-router-dom';

export default function ReplyCard({
  reply,
  threadUser,
  toggleLike,
}: {
  reply: Reply;
  threadUser: ThreadUser;
  toggleLike: (threadId: number, hasLiked: boolean) => Promise<void>;
}) {
  const navigate = useNavigate();
  return (
    <div className="border-b border-blue-950 py-2 px-2 flex gap-3">
      <div>
        <img
          src={reply.user?.photo_profile
            ? `http://localhost:3002/uploads/${reply.user.photo_profile}`
            : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
          }
          className="h-6 w-6 rounded-full object-cover cursor-pointer hover:border-blue-300 transition-colors"
          alt="profile"
          onClick={() => reply.user?.id && navigate(`/profile/${reply.user.id}`)}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="font-medium text-xs cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => reply.user?.id && navigate(`/profile/${reply.user.id}`)}
          >
            {reply.user?.full_name || "User"}
          </span>
          <span
            className="text-xs text-white cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => reply.user?.id && navigate(`/profile/${reply.user.id}`)}
          >
            @{reply.user?.username || "user"}
          </span>
          <span className="text-xs text-gray-500">
            • {new Date(reply.created_at).toLocaleDateString()}
          </span>
        </div>

        <p className="mt-1 text-black text-sm">{reply.content}</p>

        {reply.image && (
          <img
            src={`http://localhost:3002/uploads/${reply.image}`}
            className="rounded-xl mt-2 max-h-48 object-cover"
          />
        )}

        <div className="flex gap-5 mt-2 text-gray-400">
          <div
            className={`flex items-center gap-1 cursor-pointer transition hover:text-red-400 text-sm ${
              reply.isLiked ? "text-red-500" : "text-gray-400"
            }`}
            onClick={() => toggleLike(reply.id, reply.isLiked || false)}
          >
            <Heart
              size={16}
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
