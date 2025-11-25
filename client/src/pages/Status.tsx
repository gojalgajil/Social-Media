import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRepliesByThread, toggleReplyLike, addReply } from "@/stores/repliesSlice";
import { toggleThreadLike } from "@/stores/threadsSlice";
import ThreadCard from "@/components/thread/ThreadCard";
import ReplyInput from "@/components/reply/ReplyInput";
import ReplyList from "@/components/reply/ReplyList";
import { ArrowLeft } from "lucide-react";

// Like update data interface
interface LikeUpdateData {
  threadId: number;
  userId: number;
  liked: boolean;
  likesCount: number;
}

// Global callback for cross-page like synchronization
declare global {
  interface Window {
    likeUpdateCallback?: (data: LikeUpdateData) => void;
  }
}

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

interface ThreadUser {
  id: number;
  full_name?: string;
  username?: string;
  photo_profile?: string;
}

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { replies, loading: repliesLoading, error } = useSelector((state: any) => state.replies);
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string>("");


  useEffect(() => {
    if (threadId) {
      fetchThread();
      dispatch(fetchRepliesByThread(threadId));
    }
  }, [threadId, dispatch]);

  useEffect(() => {
    let userAvatarUrl = "";
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.photo_profile) {
          userAvatarUrl = `http://localhost:3002/uploads/${parsed.photo_profile}`;
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    setUserAvatar(userAvatarUrl);
  }, []);

  // Set up callback for WebSocket like updates
  useEffect(() => {
    const likeUpdateCallback = (data: LikeUpdateData) => {
      if (thread && thread.id === data.threadId) {
        setThread(prev => prev ? {
          ...prev,
          likesCount: data.likesCount,
          ...(data.userId === currentUser?.id ? { isLiked: data.liked } : {})
        } : null);
      }
    };

    // Set the global callback
    (window as any).likeUpdateCallback = likeUpdateCallback;

    // Clean up on unmount
    return () => {
      (window as any).likeUpdateCallback = undefined;
    };
  }, [thread, currentUser?.id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      // Fetch thread detail
      const threadRes = await fetch(
        `http://localhost:3002/api/threads/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const threadData = await threadRes.json();
      setThread(threadData.data);
    } catch (error) {
      console.error("Error fetching thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (content: string, image?: File) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        `http://localhost:3002/api/replies/${threadId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Add new reply to Redux store
        dispatch(addReply(data.data));

        // Optimistically update the thread's reply count
        setThread(prev => prev ? {
          ...prev,
          number_of_replies: (prev.number_of_replies || 0) + 1
        } : null);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      throw error;
    }
  };

  const handleToggleThreadLike = async (threadId: number, isLiked: boolean) => {
    if (!thread) return;

    const newIsLiked = !isLiked;
    const newLikesCount = isLiked ? (thread.likesCount || 0) - 1 : (thread.likesCount || 0) + 1;

    // Optimistic update
    setThread({...thread, isLiked: newIsLiked, likesCount: newLikesCount});

    try {
      await dispatch(toggleThreadLike({ threadId, currentIsLiked: isLiked }));
    } catch (error) {
      // Revert
      setThread(thread);
      console.error('Error toggling thread like:', error);
    }
  };

  const handleToggleReplyLike = async (replyId: number, isLiked: boolean) => {
    try {
      // Dispatch Redux action to toggle like, which will also refetch replies
      await dispatch(toggleReplyLike({ replyId, currentIsLiked: isLiked }));
      // Refetch replies after toggle to get updated data
      if (threadId) {
        dispatch(fetchRepliesByThread(threadId));
      }
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Thread not found</div>
      </div>
    );
  }

  const threadUser: ThreadUser = {
    id: thread.id,
    full_name: thread.full_name,
    username: thread.username,
    photo_profile: thread.avatar,
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Status / Thread Header */}
      <div className="border-b border-blue-950 py-4 px-4 font-semibold text-lg flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Status
      </div>

      {/* Thread utama */}
      <ThreadCard thread={thread} toggleLike={handleToggleThreadLike} />

      {/* Reply Input */}
      <ReplyInput
        threadId={parseInt(threadId || "0")}
        userAvatar={userAvatar}
        onReplySubmit={handleReplySubmit}
      />

      {/* Reply List */}
      <ReplyList replies={replies} threadUser={threadUser} toggleLike={handleToggleReplyLike} />
    </div>
  );
}
