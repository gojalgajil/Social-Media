import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

interface User {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  bio: string | null;
}

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  userId: string;
  onFollowingChanged?: () => void;
}

export default function FollowersFollowingModal({ isOpen, onClose, type, userId, onFollowingChanged }: FollowersFollowingModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: any) => state.user.token) || localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, type, userId]);

  const fetchUsers = async () => {
    if (!token || !userId) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/user/${userId}/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId: number) => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/api/user/unfollow', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId })
      });

      if (response.ok) {
        // Remove the user from the following list
        setUsers(prev => prev.filter(u => u.id !== targetUserId));
        // Notify parent component that following changed
        onFollowingChanged?.();

        // Dispatch real-time event for following count update
        window.dispatchEvent(new CustomEvent('followingCountChanged', {
          detail: { action: 'decrement' }
        }));
      } else {
        console.error('Failed to unfollow user');
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const BASE_URL = 'http://localhost:3002/uploads/';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-950 capitalize">{type}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-blue-950">Loading...</div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.photo_profile ? `${BASE_URL}${user.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-blue-950">{user.full_name}</div>
                      <div className="text-sm text-gray-600">@{user.username}</div>
                      {user.bio && (
                        <div className="text-sm text-gray-500 mt-1">{user.bio}</div>
                      )}
                    </div>
                  </div>
                  {type === 'following' && (
                    <button
                      onClick={() => handleUnfollow(user.id)}
                      className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                    >
                      Unfollow
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No {type} yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
