import React, { useState, useEffect, useRef, useMemo } from "react";
import music from './assets/iphone-sms-tone-original-mp4-5732.mp3'

export const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const listRef = useRef(null);
  const fileInputRef = useRef(null);

  const notification = useMemo(() => new Audio(music), []);

  const sendMessage = async () => {
    if (currentMessage.trim()) {
      const messageData = {
        id: crypto.randomUUID(),
        room,
        author: username,
        message: currentMessage.trim(),
        type: "text",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      notification.play().catch(e => console.log("Audio play failed", e));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      const fileName = file.name;
      const fileSize = (file.size / 1024).toFixed(2) + " KB";

      let type = "file";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("audio/")) type = "audio";
      else if (file.type.startsWith("video/")) type = "video";

      reader.onload = async (event) => {
        const messageData = {
          id: crypto.randomUUID(),
          room,
          author: username,
          message: fileName,
          fileData: event.target.result,
          fileName: fileName,
          fileSize: fileSize,
          type: type,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        };

        await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
        notification.play().catch(e => console.log("Audio play failed", e));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadFile = (fileData, fileName) => {
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handleReceiveMsg = (data) => {
      setMessageList((list) => [...list, data]);
      notification.play().catch(e => console.log("Audio play failed", e));
    };
    socket.on("receive_message", handleReceiveMsg);
    return () => socket.off("receive_message", handleReceiveMsg);
  }, [socket, notification]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messageList]);

  return (
    <div className="chat_container">
      <div className="chat_header">
        <h1>User: <span>{username}</span></h1>
      </div>
      <div className="chat_box">
        <div className="message_list" ref={listRef}>
          <div className="welcome_note">
            <h3>Welcome, {username}!</h3>
          </div>
          {messageList.map((data) => (
            <div
              key={data.id}
              className={`message_wrapper ${username === data.author ? "you" : "other"}`}
            >
              <div className="msg_bubble">
                {data.type === "image" ? (
                  <div className="media_content">
                    <img
                      src={data.fileData || data.image}
                      alt="shared"
                      className="msg_image"
                      onClick={() => setSelectedMedia(data)}
                    />
                    <button className="download_btn" onClick={() => downloadFile(data.fileData || data.image, data.fileName || "image.png")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                ) : data.type === "audio" ? (
                  <div className="audio_content">
                    <audio controls src={data.fileData}>
                      Your browser does not support the audio element.
                    </audio>
                    <button className="download_btn" onClick={() => downloadFile(data.fileData, data.fileName)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                ) : data.type === "video" ? (
                  <div className="media_content">
                    <video className="msg_video" controls src={data.fileData} />
                    <button className="download_btn" onClick={() => downloadFile(data.fileData, data.fileName)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                ) : data.type === "file" ? (
                  <div className="file_content" onClick={() => downloadFile(data.fileData, data.fileName)}>
                    <div className="file_icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                    </div>
                    <div className="file_info">
                      <span className="file_name">{data.fileName}</span>
                      <span className="file_size">{data.fileSize}</span>
                    </div>
                    <button className="download_btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                ) : (
                  <p>{data.message}</p>
                )}
              </div>
              <div className="msg_meta">
                <span className="author">{data.author}</span>
                <span className="time">{data.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="chat_footer">
          <input
            type="file"
            accept="image/*,audio/*,video/*,.txt,.pdf,.doc,.docx"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button className="media_btn" onClick={() => fileInputRef.current.click()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
          </button>
          <input
            value={currentMessage}
            type="text"
            placeholder="Type your message..."
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>

      {selectedMedia && (
        <div className="media_modal" onClick={() => setSelectedMedia(null)}>
          <div className="modal_content" onClick={(e) => e.stopPropagation()}>
            <button className="close_modal" onClick={() => setSelectedMedia(null)}>&times;</button>
            {selectedMedia.type === "image" && (
              <img src={selectedMedia.fileData || selectedMedia.image} alt="preview" />
            )}
            <div className="modal_footer">
              <span>{selectedMedia.fileName || "Shared Media"}</span>
              <button onClick={() => downloadFile(selectedMedia.fileData || selectedMedia.image, selectedMedia.fileName || "download.png")}>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

