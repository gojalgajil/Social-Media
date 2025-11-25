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

  const toggleLike = async (threadId: number, isLiked: boolean) => {
    // Find the current thread to get likesCount
    const thread = threads.find((t: any) => t.id === threadId);
    if (!thread) return;

    const currentLikesCount = thread.likesCount || 0;
    const newIsLiked = !isLiked;
    const newLikesCount = isLiked ? currentLikesCount - 1 : currentLikesCount + 1;

    // Optimistic update
    dispatch({
      type: 'threads/updateThreadLikeStatus',
      payload: {
        id: threadId,
        isLiked: newIsLiked,
        likesCount: newLikesCount
      }
    });

    try {
      await dispatch(toggleThreadLike({ threadId, currentIsLiked: isLiked }));
    } catch (error) {
      // Revert on error
      dispatch({
        type: 'threads/updateThreadLikeStatus',
        payload: {
          id: threadId,
          isLiked: isLiked,
          likesCount: currentLikesCount
        }
      });
      console.error('Failed to toggle like:', error);
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

      {/* ThreadPost */}
      <ThreadPost
        token={token!}
        userAvatar={currentUser?.photo_profile ? `http://localhost:3002/uploads/${currentUser.photo_profile}` : undefined}
        onThreadCreated={(newThread) => dispatch({ type: 'threads/addThread', payload: { ...newThread, likesCount: 0, isLiked: false } })}
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
