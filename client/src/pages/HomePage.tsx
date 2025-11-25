import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import ThreadList from "../components/thread/ThreadList";
import ThreadPost from "../components/thread/ThreadPost";
import { fetchThreads, toggleThreadLike } from "../stores/threadsSlice";
import { connectSocket } from "../services/socketService";

export default function HomePage() {
  const context = useContext(AuthContext);
  if (!context) return null;

  const { token } = context;
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const { threads, loading, error } = useSelector((state: any) => state.threads);

  useEffect(() => {
    if (token) {
      dispatch(fetchThreads());
      connectSocket(token); // Connect WebSocket for real-time updates
    }
  }, [token, dispatch]);

  // LIKE / UNLIKE
  const toggleLike = async (threadId: number, isLiked: boolean) => {
    await dispatch(toggleThreadLike({ threadId, currentIsLiked: isLiked }));
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

      {/* ThreadPost */}
      <ThreadPost
        token={token!}
        userAvatar={currentUser?.photo_profile ? `http://localhost:3002/uploads/${currentUser.photo_profile}` : undefined}
      />

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