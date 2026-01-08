/**
 * Forum Threads API endpoint
 * Handles requests for forum threads and comments
 */

// Import default threads data
import { defaultThreads } from '../assets/data/forum-data.js';

/**
 * Handle threads API requests
 * @param {Request} request - The incoming request
 * @returns {Response} The API response
 */
export async function handleThreadsRequest(request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');

    // Check if this is a request for a specific thread
    if (pathSegments.length > 3 && pathSegments[3]) {
      // Get specific thread
      const threadId = pathSegments[3];
      return getThread(threadId);
    }

    // Parse query parameters for filtering and sorting
    const category = url.searchParams.get('category') || '';
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;

    // Get all threads with filtering and pagination
    return getThreads({ category, sort, page, limit });
  } catch (error) {
    console.error('Error in threads API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Get all threads with optional filtering and pagination
 * @param {Object} params - Query parameters
 * @returns {Response} The API response
 */
function getThreads(params) {
  const { category, sort, page, limit } = params;

  // Filter threads by category if specified
  let filteredThreads = category 
    ? defaultThreads.filter(thread => thread.category === category)
    : [...defaultThreads];

  // Sort threads
  switch (sort) {
    case 'oldest':
      filteredThreads.sort((a, b) => a.date - b.date);
      break;
    case 'most-comments':
      filteredThreads.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      break;
    case 'most-views':
      filteredThreads.sort((a, b) => b.views - a.views);
      break;
    case 'newest':
    default:
      filteredThreads.sort((a, b) => b.date - a.date);
      break;
  }

  // Paginate results
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);

  // Return paginated results with metadata
  return new Response(JSON.stringify({
    threads: paginatedThreads,
    pagination: {
      page,
      limit,
      total: filteredThreads.length,
      pages: Math.ceil(filteredThreads.length / limit)
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Get a specific thread by ID
 * @param {string} threadId - The thread ID
 * @returns {Response} The API response
 */
function getThread(threadId) {
  const thread = defaultThreads.find(t => t.id === parseInt(threadId));

  if (!thread) {
    return new Response(JSON.stringify({ error: 'Thread not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response(JSON.stringify(thread), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Handle POST requests to create new threads
 * @param {Request} request - The incoming request
 * @returns {Response} The API response
 */
export async function handleCreateThread(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content || !data.author || !data.category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create new thread object
    const newThread = {
      id: defaultThreads.length + 1,
      title: data.title,
      content: data.content,
      author: data.author,
      category: data.category,
      date: new Date().getTime(),
      views: 0,
      comments: []
    };

    // Add to threads array (in a real app, this would save to a database)
    defaultThreads.unshift(newThread);

    // Return the new thread
    return new Response(JSON.stringify(newThread), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    return new Response(JSON.stringify({ error: 'Failed to create thread' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Handle POST requests to add comments to threads
 * @param {Request} request - The incoming request
 * @param {string} threadId - The thread ID
 * @returns {Response} The API response
 */
export async function handleAddComment(request, threadId) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.content || !data.author) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Find the thread
    const thread = defaultThreads.find(t => t.id === parseInt(threadId));

    if (!thread) {
      return new Response(JSON.stringify({ error: 'Thread not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create new comment object
    const newComment = {
      author: data.author,
      content: data.content,
      date: new Date().getTime()
    };

    // Add comment to thread (in a real app, this would save to a database)
    if (!thread.comments) {
      thread.comments = [];
    }
    thread.comments.push(newComment);

    // Return the new comment
    return new Response(JSON.stringify(newComment), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return new Response(JSON.stringify({ error: 'Failed to add comment' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
