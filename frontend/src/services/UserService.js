import axios from 'axios';

const API_BASE_URL = 'http://localhost/Tabolator_Casestudy/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class UserService {
  static async getAllUsers() {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async createUser(userData) {
    try {
      const response = await api.post('/user', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(id, userData) {
    try {
      const response = await api.put(`/user/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const response = await api.delete(`/user/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default UserService;
