import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThreadList from "../components/thread/ThreadList";

export default function HomePage() {
  const context = useContext(AuthContext);
  if (!context) return null;

  const { token } = context;
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchThreads();
  }, [token]);

  async function fetchThreads() {
    try {
      const response = await fetch("http://localhost:3000/api/threads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setThreads(data.data);
      } else {
        setError(data.message || "Failed to fetch threads");
      }
    } catch {
      setError("An error occurred while fetching threads");
    } finally {
      setLoading(false);
    }
  }

  // LIKE / UNLIKE
const toggleLike = async (threadId: number, isLiked: boolean) => {
  try {
    // cari thread yang mau di-like/unlike
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    // tentukan method
    const method = isLiked ? "DELETE" : "POST";

    // kirim request ke server
    await fetch(`http://localhost:3000/api/threads/${threadId}/like`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // update state lokal → langsung nambah/kurang 1
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? {
              ...t,
              isLiked: !t.isLiked,
              likesCount: t.isLiked
                ? (t.likesCount || 1) - 1
                : (t.likesCount || 0) + 1,
            }
          : t
      )
    );
  } catch (error) {
    console.log("Error toggling like:", error);
  }
};

  // Jika belum login
  if (!token) {
    return (
      <div>
        <p>Please log in to view threads.</p>
        <Link to="/login"><button>Login</button></Link>
      </div>
    );
  }

  return (
    <div className="border-l border-r border-neutral-800 min-h-screen w-full">

      {/* Header */}
      <header className="px-4 py-3 border-b border-neutral-800 sticky top-0 bg-blue-300/80 backdrop-blur">
        <h1 className="text-xl font-bold">Home</h1>
      </header>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-10">Error: {error}</div>
      ) : threads.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No threads available.</p>
      ) : (
        // kirim toggleLike ke ThreadList
        <ThreadList threads={threads} toggleLike={toggleLike} />
      )}
    </div>
  );
}
