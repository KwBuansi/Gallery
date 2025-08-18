//ImagePage.jsx
import React from 'react'
import { supabase } from "../supabase-client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ImagePage = () => {

  const [fetchError, setFetchError] = useState(null);
  const [image, setImage] = useState(null);
  const { id } = useParams();
  const imageId = Number(id);
  const navigate = useNavigate();
  const GO_BACK = -1;
  const NO_HISTORY = 1;

  useEffect(() => {

    if (!id || isNaN(id)) return;

    const fetchImage = async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select()
        .eq("id", imageId)
        .single();
      if (error) {
        setFetchError("Could not fetch image");
        setImage(null);
      } else {
        setImage(data);
        setFetchError(null);
      }
    };

    fetchImage();
  }, [id]);

  if (fetchError) return <p>{fetchError}</p>
  if (!image) return <p>Loading...</p>;

  const handleBack = () => {
    if (window.history.length > NO_HISTORY) {
        navigate(GO_BACK);
    } else {
        navigate("/dashboard")
    }
  }

  return (
    <div>
        <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
            ← 
        </button>
        <div>{image.title}</div>
        <div className="flex justify-center items-center h-screen">
            <img
                src={image.image_url}
                alt={image.title}
                className="max-w-full max-h-screen mx-auto block"
            />
        </div>
    </div>
  )
}

export default ImagePage