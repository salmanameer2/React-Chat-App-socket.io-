import React, { useState, useMemo } from 'react'
import io from 'socket.io-client'
import { Chat } from './Chat'
import music from './assets/mixkit-tile-game-reveal-960.wav';

const socket = io.connect("http://localhost:3000")

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const notification = useMemo(() => new Audio(music), []);

  const joinChat = () => {
    if (username && room) {
      socket.emit("join_room", room);
      setShowChat(true);
      notification.play().catch(e => console.log("Audio play failed", e));
    }
  };

  return (
    <div className="app_wrapper">
      {!showChat ? (
        <div className="join_room">
          <h1>Join Chat</h1>
          <input
            type="text"
            placeholder="What's your name?"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinChat()}
          />
          <input
            type="text"
            placeholder="Room ID"
            onChange={(e) => setRoom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinChat()}
          />
          <button onClick={joinChat}>Start Chatting</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App