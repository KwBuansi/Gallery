import { useState } from 'react'
import { supabase } from "../supabase-client";

const ImageEditModal = ({ image, onClose, onSave}) => {
    const [title, setTitle] = useState(image.title || "");
    const [tags, setTags] = useState(image.tags || "");
    const [sourceLink, setSourceLink] = useState(image.source_link || "");
    const [author, setAuthor] = useState(image.author || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        const { data, error } = await supabase
            .from("gallery")
            .update({ title, tags, source_link: sourceLink, author })
            .eq("id", image.id)
            .select()
            .single();

        setSaving(false);

        if (error) {
            setError(error.message);
        } else {
             onSave(data);
             onClose();
        }
    };

    const handleDelete = async () => {
        if (!image?.id || !image?.image_url) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this image?")
        if (!confirmDelete) requestAnimationFrame;

        try {
            // Get storage path
            const url = new URL(image.image_url);
            const filePath = url.pathname.split('/').slice(3).join('/');

            // Delete the file
            const { error: storageError } = await supabase.storage
                .from("gallery")
                .remove([filePath]);
            if (storageError) throw storageError;

            const { error: dbError } = await supabase
                .from("gallery")
                .delete()
                .eq("id", image.id);
            
            if (dbError) throw dbError;

            // Close modal and notify parent
            onSave(null);
            onClose();
            } catch (err) {
                console.log("Delete failed:", err);
                setError(err.message || "Failed to delete image");
            }
    };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 shadow">
        <h2 className="text-lg font-bold mb-4">Edit Image</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="block mb-2 text-sm">Title</label>
        <input
          className="border w-full px-2 py-1 mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block mb-2 text-sm">Tags</label>
        <input
          className="border w-full px-2 py-1 mb-4"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <label className="block mb-2 text-sm">Source Link</label>
        <input
          className="border w-full px-2 py-1 mb-4"
          value={sourceLink}
          onChange={(e) => setSourceLink(e.target.value)}
        />

        <label className="block mb-2 text-sm">Author</label>
        <input
          className="border w-full px-2 py-1 mb-4"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <div className="flex justify-left gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            {saving ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal