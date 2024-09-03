import React, { useContext, useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Chat from "../components/Chat";
import { AppContext } from "../context/AppContext";
import { ImSpinner9 } from "react-icons/im";

const Home = () => {
  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) setLoading(false);
  }, [chatData, userData]);

  return (
    <>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center">
          <ImSpinner9 size={30} color="blue" className="animate-spin"  />
        </div>
      ) : (
        <div className="flex h-screen bg-blue-100">
          <SideBar />
          <Chat />
        </div>
      )}
    </>
  );
};

export default Home;
