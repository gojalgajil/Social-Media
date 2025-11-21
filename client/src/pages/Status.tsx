import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ThreadCard from "@/components/thread/ThreadCard";
import ReplyInput from "@/components/reply/ReplyInput";
import ReplyList from "@/components/reply/ReplyList";
import { ArrowLeft } from "lucide-react";

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

export default function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string>("");


  useEffect(() => {
    if (threadId) {
      fetchThreadAndReplies();
    }
  }, [threadId]);

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

  const fetchThreadAndReplies = async () => {
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

      // Fetch replies
      const repliesRes = await fetch(
        `http://localhost:3002/api/replies/thread/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const repliesData = await repliesRes.json();
      setReplies(repliesData.data || []);


    } catch (error) {
      console.error("Error fetching data:", error);
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
        // Add the new reply to the list without refetching
        setReplies((prevReplies) => [...prevReplies, data.data]);
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      throw error;
    }
  };

  const toggleLike = async (threadId: number, hasLiked: boolean) => {
    // Implementasi toggle like untuk thread
    // Sesuaikan dengan API endpoint kamu
    console.log("Toggle like:", threadId, hasLiked);
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
      <ThreadCard thread={thread} toggleLike={toggleLike} />

      {/* Reply Input */}
      <ReplyInput
        threadId={parseInt(threadId || "0")}
        userAvatar={userAvatar}
        onReplySubmit={handleReplySubmit}
      />

      {/* Reply List */}
      <ReplyList replies={replies} threadUser={threadUser} />
    </div>
  );
}
