import { useState } from "react";
import { supabase } from "../supabase-client";

export const UploadModal = ({ isOpen, onClose, profile }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [author, setAuthor] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const detectAI = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-ai`, {
      method: "POST",
      headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}` },
      body: formData,
    });

    let aiResult;
    try {
      aiResult = await res.json();
    } catch (err) {
      console.error("Failed to parse AI detection response:", err);
      throw new Error("Invalid response from AI detection service");
    }

    if (!res.ok) {
      throw new Error(aiResult.error || aiResult.reason || "AI detection failed");
    }

    console.log("AI detection result:", aiResult);
    return aiResult;
  };

  const handleUpload = async () => {
    setError(null);

    if (!file || !title || !tags || !sourceLink || !author) {
      setError("Please fill out all fields and select a file.");
      return;
    }

    setUploading(true);

    try {
      const aiResult = await detectAI(file);

      if (!aiResult.success) {
        setError(`Upload blocked: ${aiResult.reason} (confidence: ${aiResult.confidence})`);
        setUploading(false);
        return;
      }

      const userId = profile?.id;
      if (!userId) throw new Error("No user profile available");

      const uploaderName = profile?.display_name || "Unknown";
      const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

      // Upload file to Supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from("gallery")
        .insert({
          image_url: publicUrl,
          tags: parsedTags,
          source_link: sourceLink,
          title,
          uploader: uploaderName,
          author,
          user_id: userId,
        })
        .select();
      if (insertError) throw insertError;

      setUploading(false);
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 z-60">
        <h2 className="text-lg font-bold mb-4">Upload Image</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2 w-full" />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2 w-full border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mb-2 w-full border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Source Link"
          value={sourceLink}
          onChange={(e) => setSourceLink(e.target.value)}
          className="mb-2 w-full border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="mb-2 w-full border px-2 py-1 rounded"
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
