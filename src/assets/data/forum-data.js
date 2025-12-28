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
        content: "Fascinating results, Dr. Rodriguez! Could you share more details about graphene support structure? We've been working on similar approaches but haven't achieved comparable efficiency gains.",
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
        content: "We've had similar issues. The solution that worked for us was implementing a multi-stage cultivation system with closed photobioreactors for initial growth phase before transferring to open ponds.",
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
    content: "Recent advances in perovskite solar cell stability are making them viable for commercial applications. Our latest prototypes have maintained 95% efficiency after 1000 hours of continuous operation under standard test conditions. The key breakthrough was in encapsulation technique.",
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
  {
    id: 6,
    title: "Advanced Nuclear Systems",
    author: "Dr. James Foster",
    date: new Date('2023-05-20T09:00:00').getTime(),
    category: "nuclear",
    views: 312,
    content: "Fourth-generation nuclear reactors represent a paradigm shift in nuclear technology with enhanced safety features, reduced waste production, and improved fuel efficiency. Small modular reactors (SMRs) offer flexible deployment options with significantly lower construction times and costs.",
    comments: [
      {
        author: "Dr. Robert Chen",
        date: new Date('2023-05-21T14:30:00').getTime(),
        content: "The passive safety systems in these designs eliminate the need for external power or human intervention in emergency scenarios, addressing one of the primary concerns with nuclear technology.",
      },
    ],
  },
  {
    id: 7,
    title: "Ammonia as Energy Carrier",
    author: "Dr. Sarah Kim",
    date: new Date('2023-05-25T11:00:00').getTime(),
    category: "ammonia",
    views: 234,
    content: "Green ammonia (NH₃) is emerging as a versatile zero-carbon energy carrier with significant advantages over direct hydrogen use. With higher energy density and established global production infrastructure, ammonia offers practical solutions for energy storage and transportation.",
    comments: [
      {
        author: "Prof. Michael Liu",
        date: new Date('2023-05-26T16:45:00').getTime(),
        content: "Ammonia can be used directly in fuel cells or combustion engines, or easily 'cracked' back to hydrogen where needed. Its relatively high boiling point (-33°C) simplifies storage and transport compared to liquid hydrogen (-253°C).",
      },
    ],
  },
  {
    id: 8,
    title: "Geothermal Energy Solutions",
    author: "Dr. Alan Martinez",
    date: new Date('2023-05-30T10:00:00').getTime(),
    category: "geothermal",
    views: 198,
    content: "Geothermal energy provides consistent baseload power with minimal environmental impact. Enhanced geothermal systems (EGS) expand the geographic range of viable resources through engineered reservoirs.",
    comments: [
      {
        author: "Dr. Patricia Williams",
        date: new Date('2023-05-31T14:30:00').getTime(),
        content: "Modern binary cycle plants enable electricity generation from lower temperature resources (as low as 100°C), dramatically expanding potential sites. When combined with district heating systems, geothermal can achieve overall energy utilization efficiencies exceeding 80%.",
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