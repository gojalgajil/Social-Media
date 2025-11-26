import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchRepliesByThread, toggleReplyLike, addReply } from "@/stores/repliesSlice";
import ReplyCard from "../reply/ReplyCard";

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  header: string | null;
  bio: string | null;
}

interface Thread {
  id: number;
  content: string;
  created_at: string;
  images?: string[];
  likesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
}

interface ThreadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: Thread | null;
  profileUser: UserProfile | null;
  token: string;
  currentUser: any;
  onToggleImagePopup: () => void;
  onToggleLike: (threadId: number, hasLiked: boolean) => Promise<void>;
};

export default function ThreadDetailModal({
  isOpen,
  onClose,
  thread,
  profileUser,
  token,
  currentUser,
  onToggleImagePopup,
  onToggleLike
}: ThreadDetailModalProps) {
  const dispatch = useDispatch();
  const { replies } = useSelector((state: any) => state.replies);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const BASE_URL = 'http://localhost:3002/uploads/';

  if (!isOpen || !thread || !profileUser) return null;

  const handleToggleThreadLike = async (threadId: number, hasLiked: boolean) => {
    console.log("Toggling like for thread:", threadId, "hasLiked:", hasLiked);

    try {
      await onToggleLike(threadId, hasLiked);
    } catch (error) {
      console.error('Error toggling thread like:', error);
    }
  };

  const handleToggleReplyLike = async (replyId: number) => {
    try {
      const currentReply = (replies as any[]).find(r => r.id === replyId);
      if (currentReply && thread) {
        // Toggle the reply like via Redux action
        await dispatch(toggleReplyLike({ replyId, currentIsLiked: currentReply.is_liked }));

        // Broadcast the update to other pages for real-time sync
        // Use the same approach as thread likes - global callback system
        if (currentUser) {
          const newLiked = !currentReply.is_liked;
          // Trigger any global reply like update callbacks (like profile pages might have)
          if ((window as any).replyLikeUpdateCallback) {
            (window as any).replyLikeUpdateCallback({
              replyId,
              userId: currentUser.id,
              liked: newLiked,
              likesCount: currentReply.likes_count ? currentReply.likes_count + (newLiked ? 1 : -1) : 1
            });
          }
        }

        // Refetch replies to ensure UI consistency
        dispatch(fetchRepliesByThread(thread.id.toString()));
      }
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  const handleReplySubmit = async (content: string, image?: File) => {
    if (!content.trim() && !image) return;

    setReplySubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const response = await fetch(
        `http://localhost:3002/api/replies/${thread.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(addReply(data.data));
        setReplyContent("");
        dispatch(fetchRepliesByThread(thread.id.toString()));
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90vw] h-[90vh] max-w-5xl rounded-xl overflow-hidden flex relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center
               bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full
               text-gray-700 hover:text-black text-xl font-bold
               transition-all cursor-pointer z-10 shadow-lg"
          onClick={onClose}
        >
          ✕
        </button>

        {/* LEFT SIDE — IMAGE */}
        <div className="w-1/2 bg-black">
          <img
            src={`${BASE_URL}${thread.images?.[0]}`}
            alt="Thread"
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={onToggleImagePopup}
          />
        </div>


        {/* RIGHT SIDE — DETAILS + COMMENTS */}
        <div className="w-1/2 flex flex-col bg-white">

          {/* USER INFO - Match Profile Page Design */}
          <div className="relative">
            {/* Header with gradient background or user banner */}
            <div
              className="relative h-24 rounded-t-xl"
              style={{
                backgroundImage: profileUser?.header ? `url(${BASE_URL}${profileUser.header})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!profileUser.header && (
                <div className="w-full h-full bg-gradient-to-r from-green-400 via-yellow-400 to-yellow-400 rounded-t-xl"></div>
              )}
              {/* Profile picture - positioned to overlap header */}
              <div className="absolute -bottom-8 left-3">
                <img
                  src={profileUser.photo_profile ? `${BASE_URL}${profileUser.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                  className="w-17 h-17 rounded-full object-cover border-3 border-blue-300"
                  alt="Profile"
                />
              </div>
            </div>

            {/* Profile info - padding-top accounts for overlapping profile pic */}
            <div className="mt-8 px-3 pb-3">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-bold text-blue-950 text-sm">{profileUser.full_name}</h3>
              </div>

              <p className="text-white text-xs mb-2">@{profileUser.username}</p>

              <p className="text-blue-950 text-xs">
                {profileUser.bio || "This user hasn't written a bio yet."}
              </p>
            </div>
          </div>

          {/* THREAD CONTENT */}
          <div className="p-4 border-b">
            <p className="text-gray-900 text-sm leading-relaxed mb-3">{thread.content}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div>
                {new Date(thread.created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })} · {new Date(thread.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* REPLIES LIST */}
          <div className="flex-1 overflow-y-auto p-4">
            {replies.map((reply: any) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadUser={{
                  id: thread.id,
                  full_name: profileUser.full_name,
                  username: profileUser.username,
                  photo_profile: profileUser.photo_profile || undefined
                }}
                toggleLike={handleToggleReplyLike}
              />
            ))}
          </div>

          {/* ACTIONS BAR - AT Bottom */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleThreadLike(thread.id, thread.isLiked || false);
                  }}
                  className={`cursor-pointer pointer-events-auto flex items-center gap-2 text-xs font-medium transition-colors ${
                    thread.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={16} className={thread.isLiked ? 'fill-current' : ''} />
                  {thread.likesCount || 0}
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-blue-500"
                >
                  <MessageCircle size={16} />
                  {thread.repliesCount || 0}
                </button>
              </div>
            </div>

            {/* REPLY INPUT */}
            <div className="flex gap-2">
              <input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                type="text"
                placeholder="Write a reply..."
                className="flex-1 border rounded-full px-3 py-2 text-sm"
              />
              <button
                onClick={() => handleReplySubmit(replyContent)}
                disabled={replySubmitting || !replyContent.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50 hover:bg-blue-400 transition"
              >
                {replySubmitting ? "Replying..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
