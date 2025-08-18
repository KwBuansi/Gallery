import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UploadModal from "./UploadModal";
import ImageEditModal from "./ImageEditModal";
import "./Masonry.css";

const POSTS_PER_PAGE = 12;
const MIN_PAGES = 1;

const Posts = () => {
  const { session } = UserAuth();
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(MIN_PAGES);
  const [selectedImage, setSelectedImage] = useState(null);
  const [totalPages, setTotalPages] = useState(MIN_PAGES);
  const [loading, setLoading] = useState(true); // loading state
  const navigate = useNavigate();
  const userId = session?.user?.id;

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (error) throw error;

        setImages(data);
        setTotalPages(Math.ceil(data.length / POSTS_PER_PAGE));
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [session]);

  const paginatedImages = images.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  if (loading) {
    return;
  }

  return (
    <div className="no-cursor focus:outline-none">
      <button 
        className="mt-5 mb-4 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
        onClick={() => navigate("/dashboard")}
      >
        Account Dashboard
      </button>

      <div className="masonry mt-5">
        {paginatedImages.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.image_url}
              alt={img.title || "Image"}
              className="rounded shadow object-cover w-full cursor-pointer"
              onClick={() => navigate(`/image/${img.id}`)}
            />
            {/* Edit button only if it's your image */}
            {img.user_id === userId && (
              <button
                onClick={() => setSelectedImage(img)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>                
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="w-full bg-white focus:outline-none flex justify-center mt-4 gap-2 items-center">
        {/* Back arrow */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          &lt;
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              page === currentPage ? "bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next arrow */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          &gt;
        </button>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <ImageEditModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onSave={(updated) => {
            if (!updated) {
              setImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
              setSelectedImage(null);
            } else {
              setImages((prev) =>
                prev.map((img) => (img.id === updated.id ? updated : img))
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default Posts;
