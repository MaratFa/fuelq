/**
 * Forum API Client
 * Handles communication with the forum API
 */

class ForumApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all forum threads
   * @returns {Promise<Array>} Array of thread objects
   */
  async getThreads() {
    try {
      const response = await fetch(`${this.baseUrl}/threads`);
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching threads:', error);
      return [];
    }
  }

  /**
   * Get a specific thread with comments
   * @param {number} threadId - ID of the thread
   * @returns {Promise<Object>} Thread object with comments
   */
  async getThread(threadId) {
    try {
      const response = await fetch(`${this.baseUrl}/threads/${threadId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching thread:', error);
      return null;
    }
  }

  /**
   * Create a new thread
   * @param {Object} threadData - Thread data
   * @returns {Promise<Object>} Created thread object
   */
  async createThread(threadData) {
    try {
      const response = await fetch(`${this.baseUrl}/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(threadData)
      });

      if (!response.ok) {
        throw new Error('Failed to create thread');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a thread
   * @param {number} threadId - ID of the thread
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment object
   */
  async addComment(threadId, commentData) {
    try {
      const response = await fetch(`${this.baseUrl}/threads/${threadId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
}

// Export singleton instance
const forumApiClient = new ForumApiClient();
export default forumApiClient;
