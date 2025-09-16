import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getConversations } from '../services/chatService';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
      // Set up WebSocket connection or polling here if needed
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      updateUnreadCount(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const updateUnreadCount = (conversations) => {
    if (!conversations) return;
    const count = conversations.reduce((total, conv) => {
      const unreadMessages = conv.messages.filter(
        msg => !msg.is_read && msg.sender !== user?.id
      );
      return total + unreadMessages.length;
    }, 0);
    setUnreadCount(count);
  };

  const markAsRead = (conversationId) => {
    // Implement marking messages as read
    // This would typically involve an API call to update the read status
  };

  const value = {
    conversations,
    unreadCount,
    activeChat,
    setActiveChat,
    refreshConversations: fetchConversations,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
