import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations } from '../../services/chatService';
import './ChatList.css';

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== user.id) || {};
  };

  if (loading) return <div className="chat-list-loading">Loading conversations...</div>;
  if (error) return <div className="chat-list-error">{error}</div>;

  return (
    <div className="chat-list-container">
      <h2 className="chat-list-title">Your Conversations</h2>
      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>No conversations yet. Start a chat from an order.</p>
        </div>
      ) : (
        <ul className="conversation-list">
          {conversations.map((conv) => {
            const otherUser = getOtherParticipant(conv);
            const lastMessage = conv.messages[conv.messages.length - 1];
            
            return (
              <li key={conv.id} className="conversation-item">
                <Link to={`/orders/${conv.order}/chat`} className="conversation-link">
                  <div className="conversation-avatar">
                    {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <span className="conversation-username">
                        {otherUser.username || 'Unknown User'}
                      </span>
                      <span className="conversation-time">
                        {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      {lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ChatList;
