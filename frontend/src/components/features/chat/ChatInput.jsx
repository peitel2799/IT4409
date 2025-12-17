import { Image, Loader2, Send, Smile, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useChat } from "../../../context/ChatContext";

// Helper: upload image to server/cloud (replace with your real API endpoint)
// async function uploadImage(file) {
  
//   // Example: POST to your backend or directly to Cloudinary
//   const res = await fetch("/api/upload", {
//     method: "POST",
//     body: formData,
//   });
//   if (!res.ok) throw new Error("Image upload failed");
//   const data = await res.json();
//   return data.url; // The image URL returned by your server/cloud
// }

export default function ChatInput({ chat }) {
  const [text, setText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { sendMessage } = useChat();
  const fileInputRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || !chat) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }
      await sendMessage(chat._id || chat.id, formData);
      toast.success("Sent");
      setText("");
      setPreviewImage(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setPreviewImage(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  const removeImage = (e) => {
    setPreviewImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
      {/* Image preview section */}
      {previewImage && (
        <div className="relative inline-block ml-3">
          <img
            src={previewImage}
            alt="preview image"
            className="w-20 h-20 object-cover rounded-lg border border-pink-500"
          />
          <button
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
            type="button"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-[24px] focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-100 focus-within:border-pink-300 transition-all shadow-sm">
        
        <input 
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button 
          type="button" 
          className={`p-2 text-gray-400 hover:text-pink-500 transition-colors
                    ${previewImage ? 'text-pink-500' : 'text-gray-400'}`
          }
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>
        

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
        />

        <button type="button" className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
          <Smile size={20} />
        </button>

        <button
          type="submit"
          disabled={loading || (!text.trim() && !imageFile)}
          className={`p-3 rounded-full transition-all shadow-sm flex items-center justify-center 
            ${(text.trim() || imageFile) && !loading ? "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-200" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          {loading ? (
            <div className="flex justify-center"><Loader2 className="animate-spin text-pink-500"/></div>
          ) : (
            <Send size={18} className={text.trim() ? "ml-0.5" : ""} />
          )}
        </button>
      </div>
    </form>
  );
}