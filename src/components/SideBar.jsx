import React, { useState } from "react";
import ChatList from "./ChatList";
import { MdMessage } from "react-icons/md";
import { CiMenuKebab } from "react-icons/ci";
import { MdEdit } from "react-icons/md";
import { logout } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const SideBar = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <div className="flex flex-col w-1/4 bg-blue-50 border-r border-blue-300">
      <div className="relative flex items-center justify-between p-5 border-b border-blue-300 bg-blue-50">
        <h3 className="text-3xl font-semibold flex items-center gap-1 text-blue-500">
          <MdMessage size={25} className="-mb-2" />
          ATalk
        </h3>
        <CiMenuKebab
          size={24}
          onClick={toggleMenu}
          className="cursor-pointer"
        />
        {isMenuVisible && (
          <div className="absolute top-16 right-7 max-w-32 w-full text-center rounded-md bg-blue-500 text-white">
            <p
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center text-xl gap-1 hover:bg-blue-400 cursor-pointer"
            >
              <MdEdit /> Edit
            </p>
            <hr className="border-white" />
            <p
              onClick={() => logout()}
              className="text-xl hover:bg-blue-400 cursor-pointer"
            >
              LogOut
            </p>
          </div>
        )}
      </div>
      <ChatList />
    </div>
  );
};

export default SideBar;
