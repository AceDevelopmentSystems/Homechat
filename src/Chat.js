import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import SpeechInput from './SpeechInput';

const SOCKET_URL = 'http://localhost:5000';

function Chat({ username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socketRef.current.emit('chat-message', { username, text: input });
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '16px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 8 }}>
      <div style={{ height: 180, overflowY: 'auto', marginBottom: 8, background: '#f4f4f4', borderRadius: 4, padding: 4 }}>
        {messages.map((msg, i) => (
          <div key={i}><b>{msg.username}:</b> {msg.text}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 4 }}>
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Say something..."
        />
        <SpeechInput onResult={setInput} disabled={false} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
