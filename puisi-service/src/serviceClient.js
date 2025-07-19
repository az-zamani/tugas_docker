const axios = require('axios');
require('dotenv').config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

class ServiceClient {
  // Verify if user exists by calling auth service
  static async verifyUserExists(userId) {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/user/${userId}`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to verify user:', error.message);
      return null;
    }
  }

  // Get user details
  static async getUserDetails(userId) {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/user/${userId}`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user details:', error.message);
      return null;
    }
  }

  // Validate JWT token with auth service
  static async validateToken(token) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/validate-token`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return null;
    }
  }
}

module.exports = ServiceClient;