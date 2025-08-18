// Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { deleteAccount } from "./helpers/api";
import UploadModal from "./UploadModal";
import ImageEditModal from "./ImageEditModal";
import "./Masonry.css";

const Dashboard = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  // Fetch profile and images
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profile")
          .select()
          .eq("id", session.user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch images
        const { data: imagesData, error: imagesError } = await supabase
          .from("gallery")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (imagesError) throw imagesError;
        setImages(imagesData);

        setFetchError(null);
      } catch (err) {
        console.error(err);
        setFetchError("Failed to fetch dashboard data");
      } finally {
        setLoading(false); // Done loading
      }
    };

    fetchData();
  }, [session, uploadModalOpen]);

  const handleDelete = async () => {
    if (!session?.access_token) return;
    try {
      await deleteAccount(session.access_token);
      navigate("/signin");
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  // Show loader while fetching data
  if (loading) {
    return;
  }

  return (
    <div className="no-cursor focus:outline-none">
      <button
        className="mt-5 mb-4 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
        onClick={() => navigate("/Posts")}
      >
        Posts
      </button>

      {fetchError && <p>{fetchError}</p>}
      {profile && <p>Welcome, {profile.display_name}</p>}

      <button
        onClick={() => profile && setUploadModalOpen(true)}
        className="hover:cursor-pointer border px-4 py-2 mt-4 text-green-700"
        disabled={!profile}
      >
        + Upload
      </button>

      <button
        onClick={handleSignOut}
        className="hover:cursor-pointer border px-4 py-2 mt-4 ml-2"
      >
        Log out
      </button>

      <button
        onClick={() => setDeleteModalOpen(true)}
        className="hover:cursor-pointer border px-4 py-2 mt-4 ml-2 text-red-700"
      >
        Delete Account
      </button>

      {deleteModalOpen && (
        <Modal onSubmit={handleDelete} onCancel={() => setDeleteModalOpen(false)}>
          <h1 className="font-bold text-red-700">Delete Account</h1>
          <p className="text-red-700">Are you sure you want to delete your account?</p>
        </Modal>
      )}

      {uploadModalOpen && profile && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          profile={profile}
        />
      )}

      <hr className="my-6" />
      <h3 className="text-lg font-bold mb-4">Your Images</h3>
      {images.length === 0 ? (
        <p>No uploads</p>
      ) : (
        <div className="masonry">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                onClick={() => navigate(`/image/${img.id}`)}
                src={img.image_url}
                alt={img.title || "Uploaded image"}
                className="rounded shadow object-cover w-full"
              />
              {/* 3-dot button */}
              <button
                onClick={() => setSelectedImage(img)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <ImageEditModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onSave={(updated) => {
            if (!updated) {
              // if the image is deleted
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

export default Dashboard;
