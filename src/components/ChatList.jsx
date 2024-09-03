import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useState } from "react";
import { db } from "../config/firebase";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ChatList = () => {
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    messagesId,
    setMessagesId,
  } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "Users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const foundUser = querySnap.docs[0].data();
          const userExists = chatData.some((chat) => chat.rId === foundUser.id);

          if (!userExists) {
            setUser(foundUser);
          } else {
            setUser(null); // Reset user if already exists
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error("Error fetching users:", error.message);
    }
  };

  const addChat = async () => {
    if (!user) return;
    try {
      const messageRef = collection(db, "Messages");
      const chatRef = collection(db, "Chats");
      const newMessageRef = doc(messageRef);

      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatRef, user.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatRef, userData.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      const userChatsRef = doc(db, "Chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();
      const chatIndex = userChatsData.chatData.findIndex(
        (c) => c.messageId === item.messageId
      );
      userChatsData.chatData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatData: userChatsData.chatData,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-scroll scrollbar scroll-smooth">
      <div className="p-4">
        <input
          type="text"
          placeholder="Search contacts..."
          className="w-full p-2 px-3 border rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={inputHandler}
        />
      </div>

      {showSearch && user ? (
        <div
          onClick={addChat}
          className="flex items-center p-5 cursor-pointer hover:bg-blue-100"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              className="w-full h-full"
              src={
                user.avatar ||
                "https://play-lh.googleusercontent.com/LeX880ebGwSM8Ai_zukSE83vLsyUEUePcPVsMJr2p8H3TUYwNg-2J_dVMdaVhfv1cHg"
              }
              alt="profile photo"
            />
          </div>
          <div className="ml-4">
            <h4 className="text-lg font-medium">{user.name}</h4>
          </div>
        </div>
      ) : (
        <div>
          {chatData?.length > 0 ? (
            chatData.map((item) => (
              <div
                key={item.messageId || item.userData.id} // Use unique key if available
                className="flex items-center p-5 cursor-pointer hover:bg-blue-100"
                onClick={() => setChat(item)}
              >
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden ${
                    item.messageSeen || item.messageId === messagesId
                      ? ""
                      : "borderimg"
                  }`}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={
                      item.userData.avatar ||
                      "https://play-lh.googleusercontent.com/LeX880ebGwSM8Ai_zukSE83vLsyUEUePcPVsMJr2p8H3TUYwNg-2J_dVMdaVhfv1cHg"
                    }
                    alt="profile photo"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">{item.userData.name}</h4>
                  <p
                    className={`text-sm ${
                      item.messageSeen || item.messageId === messagesId
                        ? "text-gray-600"
                        : "text-green-500"
                    }`}
                  >
                    {item.lastMessage}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No chats available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
