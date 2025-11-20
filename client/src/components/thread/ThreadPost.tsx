import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PostModal from "./PostModal";

interface CreateThreadProps {
  token: string;
  onThreadCreated: (newThread: any) => void;
  userAvatar?: string;
}

export default function CreateThread({ token, onThreadCreated, userAvatar }: CreateThreadProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    const res = await fetch("http://localhost:3002/api/threads", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      onThreadCreated(data.data);
      setContent("");
      setImage(null);
      setOpenModal(false); // tutup modal setelah post
    }
  };

  return (
    <>
      {/* untuk popup */}
      <PostModal open={openModal} onClose={() => setOpenModal(false)}>
  <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">

    {/* AVATAR + TEXTAREA */}
    <div className="flex gap-3">
      <img
        src={userAvatar || "https://via.placeholder.com/40"}
        className="w-10 h-10 rounded-full object-cover "
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What is happening?!"
        className="flex-1 bg-transparent text-blue-950 text-lg outline-none resize-none  placeholder-blue-950"
        autoFocus
      />

    </div>

    {/* ACTION BAR */}
    <div className="flex items-center justify-between mt-2 border-t pt-3">

      {/* Upload Image */}
      <label className="cursor-pointer hover:bg-blue-400 transition p-2 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0857C7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
      </label>

      {/* Button kecil sesuai teks */}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-blue-500 cursor-pointer"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>

  </form>
</PostModal>


      {/* ini buat tampilan sebelum diklik */}
      <div className="border-b p-4 flex gap-3">
        <img
          src={userAvatar || "https://via.placeholder.com/40"}
          className="w-10 h-10 rounded-full object-cover"
        />

        {/* textarea palsu (untuk buka modal) */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-start gap-2">

            <textarea
              placeholder="What is happening?!"
              className="flex-1 bg-transparent placeholder-gray-500 border-none outline-none resize-none min-h-[60px]"
              readOnly
              onClick={() => setOpenModal(true)}   // >>> buka modal
            />

            {/* tombol upload & post disembunyikan agar tampilannya rapih */}
            <div className="flex items-center gap-2 pointer-events-none">
              <label className="p-2 rounded-full">
                {/* icon dummy biar layoutnya sama */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="25"
                  fill="none"
                  stroke="#0857C7"
                  strokeWidth="2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </label>

              <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-full">
                Post
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
