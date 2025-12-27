var defaultThreads = [
  {
    id: 1,
    title: "Latest developments in hydrogen fuel cell efficiency",
    author: "Dr. Elena Rodriguez",
    date: new Date('2023-05-15T10:30:00').getTime(),
    category: "hydrogen",
    views: 245,
    content: "I wanted to share some exciting research from our lab on improving PEM fuel cell efficiency. We've achieved a 12% improvement in energy conversion through novel catalyst materials. The key was using a graphene-supported platinum alloy that reduces catalyst poisoning while maintaining conductivity.",
    comments: [
      {
        author: "Prof. James Chen",
        date: new Date('2023-05-15T14:22:00').getTime(),
        content: "Fascinating results, Dr. Rodriguez! Could you share more details about the graphene support structure? We've been working on similar approaches but haven't achieved comparable efficiency gains.",
      },
      {
        author: "Sarah Kim",
        date: new Date('2023-05-16T09:15:00').getTime(),
        content: "This is very promising for transportation applications. Have you tested these under real-world temperature and pressure conditions?",
      },
    ],
  },
  {
    id: 2,
    title: "Third-generation biofuels from algae: scalability challenges",
    author: "Michael Thompson",
    date: new Date('2023-05-12T16:45:00').getTime(),
    category: "biofuels",
    views: 189,
    content: "Our pilot project for algae-based biodiesel is facing significant challenges in scaling up. While lab results show excellent energy density and low carbon footprint, maintaining consistent algae quality in larger ponds has proven difficult. We're seeing contamination issues that significantly impact yield.",
    comments: [
      {
        author: "Dr. Amara Okonkwo",
        date: new Date('2023-05-13T08:30:00').getTime(),
        content: "We've had similar issues. The solution that worked for us was implementing a multi-stage cultivation system with closed photobioreactors for the initial growth phase before transferring to open ponds.",
      },
    ],
  },
  {
    id: 3,
    title: "Perovskite solar cells in commercial applications",
    author: "Dr. Lisa Park",
    date: new Date('2023-05-10T11:20:00').getTime(),
    category: "solar",
    views: 312,
    content: "Recent advances in perovskite solar cell stability are making them viable for commercial applications. Our latest prototypes have maintained 95% efficiency after 1000 hours of continuous operation under standard test conditions. The key breakthrough was in the encapsulation technique.",
    comments: [
      {
        author: "Robert Zhang",
        date: new Date('2023-05-11T14:45:00').getTime(),
        content: "This is excellent news! Have you tested these modules in varying temperature conditions? The main concern for commercial adoption has always been performance degradation under thermal cycling.",
      },
    ],
  },
  {
    id: 4,
    title: "Vertical axis wind turbines for urban environments",
    author: "Jennifer Wu",
    date: new Date('2023-05-08T13:15:00').getTime(),
    category: "wind",
    views: 156,
    content: "I'm researching the viability of vertical axis wind turbines (VAWTs) for urban environments. Traditional horizontal axis turbines are problematic in cities due to turbulent wind conditions. VAWTs seem more suitable but have lower efficiency. Has anyone worked on hybrid designs that might offer the best of both approaches?",
    comments: [
      {
        author: "Tom Anderson",
        date: new Date('2023-05-09T10:30:00').getTime(),
        content: "We've been working on a VAWT design with variable pitch blades that adapts to changing wind conditions. Early tests show a 15% efficiency improvement over fixed-pitch designs.",
      },
    ],
  },
  {
    id: 5,
    title: "Energy storage solutions for intermittent renewables",
    author: "Dr. Hassan Al-Mansour",
    date: new Date('2023-05-05T15:30:00').getTime(),
    category: "general",
    views: 278,
    content: "The main challenge with solar and wind energy is intermittency. I'm interested in discussing various energy storage solutions beyond traditional batteries. What are your thoughts on hydrogen storage, pumped hydro, and thermal storage for grid-scale applications?",
    comments: [
      {
        author: "Emma Wilson",
        date: new Date('2023-05-06T09:45:00').getTime(),
        content: "Our research indicates that a hybrid approach is most effective. Combining short-term battery storage with medium-term hydrogen and long-term pumped hydro offers the best balance of efficiency and cost.",
      },
    ],
  },
];

// Initialize threads from localStorage or use defaultThreads
var threads = [];
if (typeof localStorage !== "undefined" && localStorage.getItem("threads")) {
  try {
    threads = JSON.parse(localStorage.getItem("threads"));
  } catch (e) {
    console.error("Error parsing threads from localStorage:", e);
    threads = defaultThreads;
  }
} else {
  threads = defaultThreads;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("threads", JSON.stringify(defaultThreads));
  }
}