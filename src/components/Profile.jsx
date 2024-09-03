import { onAuthStateChanged } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../lib/uploadFile";
import { AppContext } from "../context/AppContext";

const Profile = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setUserData } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.name) setName(userData.name);
          if (userData.bio) setBio(userData.bio);
          if (userData.avatar) setPrevImage(userData.avatar);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const profileUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Please upload a profile picture!");
        return;
      }

      const docRef = doc(db, "Users", uid);
      if (image) {
        const imgUrl = await upload(image, setUploadProgress);
        setPrevImage(imgUrl);
        await updateDoc(docRef, {
          avatar: imgUrl,
          bio: bio,
          name: name,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      toast.success("Profile updated successfully!");
      setUploadProgress(null);
      navigate("/chat");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://plus.unsplash.com/premium_photo-1673306778968-5aab577a7365?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFja2dyb3VuZCUyMGltYWdlfGVufDB8fDB8fHww')] bg-cover bg-no-repeat flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl w-full max-w-md">
        <form onSubmit={profileUpdate}>
          <h3 className="text-3xl text-red-500 font-bold mb-6 text-center">
            Profile Details
          </h3>
          <label
            htmlFor="avatar"
            className="flex flex-col items-center mb-6 cursor-pointer"
          >
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              className="w-24 aspect-square rounded-full mb-4 border-4 border-white shadow-md"
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage ||
                    "https://play-lh.googleusercontent.com/LeX880ebGwSM8Ai_zukSE83vLsyUEUePcPVsMJr2p8H3TUYwNg-2J_dVMdaVhfv1cHg"
              }
              alt="profile logo"
            />
            <span className="text-red-500 hover:underline transition-colors">
              Upload profile image
            </span>
          </label>
          {/* Display upload progress below the image */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-300 rounded-full h-4 mb-6">
              <div
                className="bg-red-600 h-4 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name..."
            required
            className="w-full p-3 mb-6 bg-transparent border-2 text-[17px] border-pink-300 rounded-lg placeholder-red-600 text-red-600 focus:outline-none"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write Profile bio..."
            required
            className="w-full p-3 mb-6 bg-transparent bg-opacity-20 border-2 border-pink-300 rounded-lg text-red-600 placeholder-red-600 focus:outline-none"
          ></textarea>
          <button
            type="submit"
            className="w-full p-3 bg-red-600 bg-opacity-70 text-white rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
