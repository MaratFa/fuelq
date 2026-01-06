// Forum API with authentication

import { isAuthenticated, authFetch } from './auth.js';

// Get all threads
export async function getThreads() {
    try {
        const response = await fetch('/api/forum/threads');
        if (!response.ok) {
            throw new Error('Failed to fetch threads');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
    }
}

// Get a specific thread
export async function getThread(threadId) {
    try {
        const response = await fetch(`/api/forum/threads/${threadId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch thread');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching thread:', error);
        throw error;
    }
}

// Get posts for a thread
export async function getPosts(threadId) {
    try {
        const response = await fetch(`/api/forum/threads/${threadId}/posts`);
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

// Create a new thread (requires authentication)
export async function createThread(title, content) {
    if (!isAuthenticated()) {
        throw new Error('Authentication required');
    }

    try {
        const response = await authFetch('/api/forum/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create thread');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
}

// Create a new post (requires authentication)
export async function createPost(threadId, content) {
    if (!isAuthenticated()) {
        throw new Error('Authentication required');
    }

    try {
        const response = await authFetch(`/api/forum/threads/${threadId}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create post');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}
