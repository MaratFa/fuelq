/**
 * Forum API Client - Fixed Version
 * Handles communication with the forum API
 */

interface Thread {
  id?: number;
  title: string;
  content: string;
  author: string;
  date: string;
  comments?: Comment[];
}

interface Comment {
  id?: number;
  threadId: number;
  content: string;
  author: string;
  date: string;
}

class ForumApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = window.location.origin + '/src/api/forum') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all forum threads
   * @returns Array of thread objects
   */
  async getThreads(): Promise<Thread[]> {
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
   * @param threadId - ID of the thread
   * @returns Thread object with comments
   */
  async getThread(threadId: number): Promise<Thread | null> {
    try {
      const url = `/api/forum/threads/${threadId}`;
      console.log(`Fetching thread from: ${url}`);
      const response = await fetch(url);
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
   * @param threadData - Thread data
   * @returns Created thread object
   */
  async createThread(threadData: Omit<Thread, 'id' | 'comments'>): Promise<Thread> {
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
   * @param threadId - ID of the thread
   * @param commentData - Comment data
   * @returns Created comment object
   */
  async addComment(threadId: number, commentData: Omit<Comment, 'id' | 'threadId'>): Promise<Comment> {
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
