import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchUser {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  bio: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const debounceTimeout = useRef<number | null>(null);

  const token = localStorage.getItem("token");

  // Debounced search for suggestions
  const searchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`http://localhost:3002/api/user/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 8)); // Limit to 8 suggestions
        setShowSuggestions(data.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  }, [token]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for suggestions
    debounceTimeout.current = window.setTimeout(() => {
      searchSuggestions(value);
    }, 300); // 300ms delay
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // Hide suggestions
    setShowSuggestions(false);

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`http://localhost:3002/api/user/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (user: SearchUser) => {
    setQuery(user.username); // Set the username in the input
    setShowSuggestions(false);
    // Could also navigate directly to profile here if preferred
    // navigate(`/profile/${user.id}`);
  };

  const BASE_URL = 'http://localhost:3002/uploads/';

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <ArrowLeft
          size={24}
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate('/')}
        />
        <h1 className="text-2xl font-bold text-blue-950">Search Users</h1>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for users by username or name..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors"
            disabled={loading || !query.trim()}
          >
            <SearchIcon size={24} />
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchLoading ? (
              <div className="px-4 py-3 text-gray-600">Searching...</div>
            ) : (
              suggestions.map(user => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(user)}
                >
                  <img
                    src={user.photo_profile ? `${BASE_URL}${user.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-blue-950 text-sm">{user.full_name}</div>
                    <div className="text-xs text-gray-600">@{user.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-blue-950">Searching...</div>
            </div>
          ) : users.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-blue-950">
                Found {users.length} user{users.length !== 1 ? 's' : ''}
              </h2>
              <div className="space-y-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.photo_profile ? `${BASE_URL}${user.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-blue-950">{user.full_name}</div>
                        <div className="text-sm text-gray-600">@{user.username}</div>
                        {user.bio && (
                          <div className="text-sm text-gray-500 mt-1">{user.bio}</div>
                        )}
                      </div>
                    </div>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">
                No users found matching "{query}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!searched && (
        <div className="text-center py-12">
          <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Search for Users</h3>
          <p className="text-gray-500">
            Enter a username or full name to find other users on the platform.
          </p>
        </div>
      )}
    </div>
  );
}
