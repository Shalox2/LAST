import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getChatHistory, sendMessage } from '../../services/chatService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { orderId } = useParams();
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // Load chat history
  useEffect(() => {
    const loadChat = async () => {
      try {
        const chatHistory = await getChatHistory(orderId);
        setMessages(chatHistory);
        setLoading(false);
      } catch (err) {
        setError('Failed to load chat history');
        setLoading(false);
      }
    };

    loadChat();
  }, [orderId]);

  // WebSocket connection
  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${orderId}/`);

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, {
        id: data.message_id,
        content: data.message,
        sender: data.sender_id,
        timestamp: data.timestamp,
        is_read: true
      }]);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [orderId]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = {
        content: newMessage,
        sender: user.id,
        timestamp: new Date().toISOString(),
        is_read: false
      };

      // Send message via WebSocket
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          'message': newMessage,
          'sender_id': user.id
        }));
      }

      // Also send via HTTP for persistence
      await sendMessage(orderId, { content: newMessage });
      
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) return <div className="chat-loading">Loading chat...</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}
          >
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
