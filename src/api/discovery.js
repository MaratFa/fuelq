/**
 * Discovery API endpoint
 * Handles requests for discovery content, filtering, and recommendations
 */

// Mock data for demonstration
const mockData = {
  trendingTopics: [
    {
      id: 1,
      title: "Breakthrough in hydrogen fuel cell efficiency",
      category: "hydrogen",
      author: "Dr. Elena Rodriguez",
      views: 1250,
      comments: 42,
      tags: ["hydrogen", "fuel cells", "efficiency"],
      excerpt: "New catalyst design improves PEM fuel cell efficiency by 15%",
      trending: true
    },
    {
      id: 2,
      title: "Scaling algae-based biofuel production",
      category: "biofuels",
      author: "Michael Thompson",
      views: 980,
      comments: 31,
      tags: ["biofuels", "algae", "production"],
      excerpt: "New cultivation techniques show promise for commercial scale",
      trending: true
    },
    {
      id: 3,
      title: "Perovskite solar cells reach commercial viability",
      category: "solar",
      author: "Dr. Lisa Park",
      views: 1520,
      comments: 57,
      tags: ["solar", "perovskite", "commercial"],
      excerpt: "Stability issues resolved through new encapsulation techniques",
      trending: true
    }
  ],
  featuredExperts: [
    {
      id: 1,
      name: "Dr. Elena Rodriguez",
      title: "Hydrogen Fuel Cell Researcher",
      organization: "Energy Research Institute",
      avatar: "/src/assets/images/default-avatar.png",
      expertise: ["Hydrogen", "Fuel Cells", "Catalysis"],
      bio: "Leading researcher in PEM fuel cell technology with 15 years of experience",
      followers: 842,
      following: false
    },
    {
      id: 2,
      name: "Prof. James Chen",
      title: "Alternative Energy Specialist",
      organization: "University of Energy Studies",
      avatar: "/src/assets/images/default-avatar.png",
      expertise: ["Solar", "Wind", "Energy Storage"],
      bio: "Expert in renewable energy systems and grid integration",
      followers: 1205,
      following: false
    },
    {
      id: 3,
      name: "Dr. Amara Okonkwo",
      title: "Biofuels Research Director",
      organization: "Sustainable Fuels Lab",
      avatar: "/src/assets/images/default-avatar.png",
      expertise: ["Biofuels", "Sustainability", "Algae"],
      bio: "Pioneering work in third-generation biofuel development",
      followers: 678,
      following: false
    }
  ],
  recommendedContent: [
    {
      id: 1,
      type: "discussion",
      title: "Comparing energy storage solutions for grid applications",
      author: "Dr. Hassan Al-Mansour",
      date: "2023-06-15",
      category: "general",
      thumbnail: "/src/assets/images/default-resource.png",
      excerpt: "Analysis of battery, hydrogen, and pumped hydro storage options",
      views: 542,
      comments: 23
    },
    {
      id: 2,
      type: "article",
      title: "The future of small modular nuclear reactors",
      author: "Dr. James Foster",
      date: "2023-06-10",
      category: "nuclear",
      thumbnail: "/src/assets/images/default-resource.png",
      excerpt: "How SMRs could transform the energy landscape",
      views: 892,
      comments: 45
    },
    {
      id: 3,
      type: "resource",
      title: "Complete guide to ammonia as energy carrier",
      author: "Dr. Sarah Kim",
      date: "2023-06-05",
      category: "ammonia",
      thumbnail: "/src/assets/images/default-resource.png",
      excerpt: "Technical overview of production, storage, and applications",
      views: 721,
      comments: 18
    }
  ]
};

/**
 * Handle discovery API requests
 * @param {Request} request - The incoming request
 * @returns {Response} The API response
 */
export async function handleDiscoveryRequest(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const contentType = searchParams.get('contentType') || '';
    const energyType = searchParams.get('energyType') || '';
    const sortBy = searchParams.get('sortBy') || 'trending';

    // Filter data based on parameters
    let filteredData = filterData(mockData, { search, contentType, energyType, sortBy });

    // Return filtered data as JSON
    return new Response(JSON.stringify(filteredData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in discovery API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Filter data based on provided parameters
 * @param {Object} data - The original data
 * @param {Object} params - Filtering parameters
 * @returns {Object} Filtered data
 */
function filterData(data, params) {
  const { search, contentType, energyType, sortBy } = params;

  // Filter trending topics
  let filteredTrendingTopics = data.trendingTopics.filter(topic => {
    // Search filter
    if (search && !topic.title.toLowerCase().includes(search.toLowerCase()) && 
        !topic.excerpt.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Content type filter
    if (contentType && !contentType.includes('discussions')) {
      return false;
    }

    // Energy type filter
    if (energyType && !energyType.includes(topic.category)) {
      return false;
    }

    return true;
  });

  // Filter featured experts
  let filteredExperts = data.featuredExperts.filter(expert => {
    // Search filter
    if (search && !expert.name.toLowerCase().includes(search.toLowerCase()) && 
        !expert.bio.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Content type filter
    if (contentType && !contentType.includes('experts')) {
      return false;
    }

    // Energy type filter
    if (energyType) {
      const hasMatchingExpertise = expert.expertise.some(exp => 
        energyType.includes(exp.toLowerCase())
      );
      if (!hasMatchingExpertise) {
        return false;
      }
    }

    return true;
  });

  // Filter recommended content
  let filteredContent = data.recommendedContent.filter(content => {
    // Search filter
    if (search && !content.title.toLowerCase().includes(search.toLowerCase()) && 
        !content.excerpt.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Content type filter
    if (contentType && !contentType.includes(content.type)) {
      return false;
    }

    // Energy type filter
    if (energyType && !energyType.includes(content.category)) {
      return false;
    }

    return true;
  });

  // Sort data
  if (sortBy === 'recent') {
    filteredTrendingTopics.sort((a, b) => b.views - a.views);
    filteredContent.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === 'popular') {
    filteredTrendingTopics.sort((a, b) => b.views - a.views);
    filteredContent.sort((a, b) => b.views - a.views);
  } else if (sortBy === 'relevant') {
    // In a real implementation, this would use a relevance algorithm
    // For now, we'll just sort by views
    filteredTrendingTopics.sort((a, b) => b.views - a.views);
    filteredContent.sort((a, b) => b.views - a.views);
  }

  return {
    trendingTopics: filteredTrendingTopics,
    featuredExperts: filteredExperts,
    recommendedContent: filteredContent
  };
}
