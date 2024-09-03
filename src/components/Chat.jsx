import React, { useContext, useEffect, useState } from "react";
import { db, logout } from "../config/firebase";
import { AppContext } from "../context/AppContext";
import { CiImageOn } from "react-icons/ci";
import { MdMessage } from "react-icons/md";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import upload from "../lib/uploadFile";

const Chat = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messageImages, setMessagesImages] = useState([]);
  const { userData, messagesId, chatUser, messages, setMessages } =
    useContext(AppContext);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    let tempVar = [];
    messages.map((message) => {
      if (message.image) {
        tempVar.push(message.image);
      }
    });

    setMessagesImages(tempVar);
  }, [messages]);

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "Messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
        console.log(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "Messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "Chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatData[chatIndex].rId === userData.id) {
              userChatData.chatData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatData: userChatData.chatData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  const covertTimeStamps = (timeStamp) => {
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + " PM";
    } else {
      return hour + ":" + minute + "AM";
    }
  };

  const sendImages = async (e) => {
    try {
      const fileURL = await upload(e.target.files[0]);
      if (fileURL && messagesId) {
        await updateDoc(doc(db, "Messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileURL,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "Chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatData[chatIndex].lastMessage = "Image";
            userChatData.chatData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatData[chatIndex].rId === userData.id) {
              userChatData.chatData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatData: userChatData.chatData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return chatUser ? (
    <div className="w-[75%]">
      <div className="flex flex-col w-full h-full bg-blue-100">
        <div className="p-2.5 border-b border-blue-300 bg-blue-50">
          <div className="relative flex items-center gap-2">
            <img
              className="w-14 aspect-square rounded-full border ml-3 cursor-pointer"
              src={
                chatUser.userData.avatar ||
                "https://play-lh.googleusercontent.com/LeX880ebGwSM8Ai_zukSE83vLsyUEUePcPVsMJr2p8H3TUYwNg-2J_dVMdaVhfv1cHg"
              }
              alt="contact profile"
              onClick={toggleSidebar}
            />
            <h3 className="text-2xl p-0.5 font-semibold">
              {chatUser.userData.name}
            </h3>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col-reverse gap-2 scrollbar scroll-smooth overflow-y-scroll">
          {/* Sender messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sId === userData.id
                  ? "flex items-end justify-end gap-1 px-4"
                  : "flex items-end justify-end gap-1 px-4 flex-row-reverse"
              }
            >
              {message["image"] ? (
                <img
                  className="w-80 aspect-square mb-7 rounded-md"
                  src={message.image}
                  alt="message image"
                />
              ) : (
                <p
                  className={
                    message.sId === userData.id
                      ? "text-white bg-blue-500 p-2 max-w-96 text-[16px] borders mb-7 shadow-md"
                      : "bg-white p-2 max-w-96 text-[16px] borderr mb-7 shadow-md"
                  }
                >
                  {message.text}
                </p>
              )}

              <div className="text-center text-sm">
                <img
                  className="w-9 aspect-square rounded-full"
                  src={
                    message.sId === userData.id
                      ? userData.avatar
                      : chatUser.userData.avatar
                  }
                  alt={
                    message.sId === userData.id ? "s-msg photo" : "r-msg photo"
                  }
                />
                <p>{covertTimeStamps(message.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* message input */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border-t border-blue-300">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 text-sm rounded-full border-2 border-blue-400 outline-none"
          />
          <input
            onChange={sendImages}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <CiImageOn size={28} className="cursor-pointer" />
          </label>
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500"
          >
            Send
          </button>
        </div>
      </div>

      {/* Profile Sidebar */}
      {isSidebarVisible && (
        <div className="absolute top-0 right-0 w-[400px] h-full text-white bg-gray-950 scrollbar scroll-smooth overflow-y-auto z-10">
          <div className="p-4">
            <img
              className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
              src={
                chatUser.userData.avatar ||
                "https://play-lh.googleusercontent.com/LeX880ebGwSM8Ai_zukSE83vLsyUEUePcPVsMJr2p8H3TUYwNg-2J_dVMdaVhfv1cHg"
              }
              alt="profile"
            />
            <h2 className="flex items-center justify-center text-center text-xl font-bold mb-2">
              {chatUser.userData.name}
            </h2>
            <p className="text-center mb-4">{chatUser.userData.bio}</p>
            <hr className="border-gray-700 mb-4" />
            <div>
              <p className="text-lg mb-2">Media</p>
              <div className="grid grid-cols-3 gap-2">
                {messageImages.map((url, index) => (
                  <img
                    onClick={() => window.open(url)}
                    key={index}
                    className="w-full aspect-square object-cover rounded-md cursor-pointer"
                    src={
                      url ||
                      "https://cdn.pixabay.com/photo/2017/05/27/19/29/profile-2349288_640.jpg"
                    }
                    alt="media"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              className="text-center py-2 px-10 rounded-2xl bg-red-600 hover:bg-red-700 transition-colors"
            >
              LogOut
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="w-[75%]">
      <div className="h-full w-full flex items-center justify-center flex-col gap-2 -mt-16">
        <MdMessage size={350} color="blue" />
        <p className="text-2xl font-semibold">Chat anytime, anywhere 😁</p>
      </div>
    </div>
  );
};

export default Chat;
