import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}chat/`;

// Get chat history for an order
export const getChatHistory = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}conversations/order/${orderId}/`);
    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (orderId, messageData) => {
  try {
    const response = await axios.post(
      `${API_URL}orders/${orderId}/start-chat/`,
      messageData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get list of conversations
export const getConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}conversations/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};
