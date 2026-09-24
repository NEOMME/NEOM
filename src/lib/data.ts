import type {
  Application,
  Country,
  EmailCampaign,
  Promotion,
  University,
  UniversityCategory,
  User,
} from "./types";

export const NEOM_KNOWLEDGE = `
Neom (NEMP) — Neom Educational Mobility Platform — is an AI-powered university application platform.
We help students discover, compare, and apply to universities worldwide with a smooth, guided process.

Our services:
- Multi-step guided application process with clear instructions at every step
- AI assistant that helps students understand programs, requirements, and deadlines
- University discovery by country, category, and program
- Document checklist and application tracking
- Personalized recommendations based on academic profile

Application process (6 steps):
1. Profile — Personal information and contact details
2. Destination — Choose country and preferred universities
3. Academic — Education history, GPA, and credentials
4. Programs — Select degree programs and specializations
5. Documents — Upload transcripts, passport, recommendations
6. Review & Submit — Final review before submission

We partner with universities across Europe, North America, Asia, and the Middle East.
Categories include: Engineering & Technology, Business & Economics, Medicine & Health,
Arts & Humanities, Natural Sciences, and Social Sciences.

Contact: support@neom.edu | Process typically takes 2-4 weeks after submission.
`;

export const countries: Country[] = [
  { id: "uk", name: "United Kingdom", code: "GB", flag: "🇬🇧" },
  { id: "us", name: "United States", code: "US", flag: "🇺🇸" },
  { id: "ca", name: "Canada", code: "CA", flag: "🇨🇦" },
  { id: "de", name: "Germany", code: "DE", flag: "🇩🇪" },
  { id: "au", name: "Australia", code: "AU", flag: "🇦🇺" },
  { id: "ae", name: "United Arab Emirates", code: "AE", flag: "🇦🇪" },
  { id: "sg", name: "Singapore", code: "SG", flag: "🇸🇬" },
  { id: "nl", name: "Netherlands", code: "NL", flag: "🇳🇱" },
];

export const categories: UniversityCategory[] = [
  {
    id: "eng-tech",
    name: "Engineering & Technology",
    description: "Computer science, AI, robotics, and engineering programs",
    icon: "Cpu",
    color: "#06b6d4",
  },
  {
    id: "business",
    name: "Business & Economics",
    description: "MBA, finance, management, and entrepreneurship",
    icon: "TrendingUp",
    color: "#8b5cf6",
  },
  {
    id: "medicine",
    name: "Medicine & Health",
    description: "Medical, nursing, public health, and biomedical sciences",
    icon: "Heart",
    color: "#f43f5e",
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    description: "Design, literature, philosophy, and creative arts",
    icon: "Palette",
    color: "#f59e0b",
  },
  {
    id: "science",
    name: "Natural Sciences",
    description: "Physics, chemistry, biology, and environmental science",
    icon: "Atom",
    color: "#10b981",
  },
  {
    id: "social",
    name: "Social Sciences",
    description: "Psychology, sociology, political science, and law",
    icon: "Users",
    color: "#3b82f6",
  },
];

export const universities: University[] = [
  {
    id: "oxford",
    name: "University of Oxford",
    countryId: "uk",
    categoryIds: ["eng-tech", "business", "medicine", "science"],
    description: "World-renowned research university with exceptional academic standards.",
    tuition: "£28,000–£45,000/year",
    ranking: 1,
    programs: ["Computer Science", "MBA", "Medicine", "Law", "Physics"],
    deadline: "2026-01-15",
    published: true,
  },
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    countryId: "us",
    categoryIds: ["eng-tech", "science", "business"],
    description: "Leading institution for science, technology, and innovation.",
    tuition: "$57,000–$62,000/year",
    ranking: 2,
    programs: ["AI & Machine Learning", "Electrical Engineering", "Data Science", "MBA"],
    deadline: "2026-01-01",
    published: true,
  },
  {
    id: "toronto",
    name: "University of Toronto",
    countryId: "ca",
    categoryIds: ["eng-tech", "medicine", "business", "social"],
    description: "Canada's top university with diverse programs and research opportunities.",
    tuition: "CAD 45,000–58,000/year",
    ranking: 18,
    programs: ["Computer Engineering", "Medicine", "Business Administration", "Psychology"],
    deadline: "2026-02-01",
    published: true,
  },
  {
    id: "tum",
    name: "Technical University of Munich",
    countryId: "de",
    categoryIds: ["eng-tech", "science"],
    description: "Germany's premier technical university with low tuition fees.",
    tuition: "€150–€6,000/semester",
    ranking: 28,
    programs: ["Mechanical Engineering", "Informatics", "Physics", "Architecture"],
    deadline: "2026-03-15",
    published: true,
  },
  {
    id: "melbourne",
    name: "University of Melbourne",
    countryId: "au",
    categoryIds: ["business", "medicine", "arts", "science"],
    description: "Australia's leading university with strong international reputation.",
    tuition: "AUD 42,000–55,000/year",
    ranking: 33,
    programs: ["Commerce", "Medicine", "Arts", "Environmental Science"],
    deadline: "2026-02-28",
    published: true,
  },
  {
    id: "khalifa",
    name: "Khalifa University",
    countryId: "ae",
    categoryIds: ["eng-tech", "science", "medicine"],
    description: "Leading research university in the UAE focused on STEM excellence.",
    tuition: "AED 80,000–120,000/year",
    ranking: 181,
    programs: ["Aerospace Engineering", "Biomedical Engineering", "Computer Science"],
    deadline: "2026-04-01",
    published: true,
  },
  {
    id: "nus",
    name: "National University of Singapore",
    countryId: "sg",
    categoryIds: ["eng-tech", "business", "medicine", "social"],
    description: "Asia's top university with world-class facilities and faculty.",
    tuition: "SGD 29,000–38,000/year",
    ranking: 8,
    programs: ["Computer Science", "Business Analytics", "Medicine", "Law"],
    deadline: "2026-02-15",
    published: true,
  },
  {
    id: "delft",
    name: "Delft University of Technology",
    countryId: "nl",
    categoryIds: ["eng-tech", "science"],
    description: "Netherlands' largest and most comprehensive university of technology.",
    tuition: "€12,000–€18,000/year",
    ranking: 47,
    programs: ["Aerospace Engineering", "Civil Engineering", "Computer Science"],
    deadline: "2026-04-15",
    published: true,
  },
];

export const defaultUsers: User[] = [
  {
    id: "admin-1",
    name: "Sarah Admin",
    email: "admin@neom.edu",
    role: "admin",
    createdAt: "2025-06-01",
  },
  {
    id: "student-1",
    name: "Ahmed Hassan",
    email: "ahmed@student.com",
    role: "student",
    country: "Egypt",
    createdAt: "2025-09-01",
  },
  {
    id: "student-2",
    name: "Maria Garcia",
    email: "maria@student.com",
    role: "student",
    country: "Spain",
    createdAt: "2025-09-05",
  },
  {
    id: "student-3",
    name: "James Chen",
    email: "james@student.com",
    role: "student",
    country: "China",
    createdAt: "2025-09-10",
  },
];

export const defaultApplications: Application[] = [
  {
    id: "app-1",
    studentId: "student-1",
    studentName: "Ahmed Hassan",
    studentEmail: "ahmed@student.com",
    universityId: "oxford",
    universityName: "University of Oxford",
    countryName: "United Kingdom",
    status: "under_review",
    steps: [
      { id: "s1", title: "Profile", description: "Personal information", completed: true },
      { id: "s2", title: "Destination", description: "Country & university", completed: true },
      { id: "s3", title: "Academic", description: "Education history", completed: true },
      { id: "s4", title: "Programs", description: "Program selection", completed: true },
      { id: "s5", title: "Documents", description: "Upload documents", completed: true },
      { id: "s6", title: "Review", description: "Final review", completed: true },
    ],
    personalInfo: {
      fullName: "Ahmed Hassan",
      dateOfBirth: "2002-03-15",
      nationality: "Egyptian",
      phone: "+20 100 123 4567",
    },
    academicInfo: {
      degree: "Bachelor of Engineering",
      gpa: "3.8",
      institution: "Cairo University",
      graduationYear: "2025",
    },
    documents: ["transcript.pdf", "passport.pdf", "recommendation.pdf"],
    notes: "Strong candidate for Computer Science program.",
    createdAt: "2025-09-15",
    updatedAt: "2025-09-20",
  },
  {
    id: "app-2",
    studentId: "student-2",
    studentName: "Maria Garcia",
    studentEmail: "maria@student.com",
    universityId: "mit",
    universityName: "Massachusetts Institute of Technology",
    countryName: "United States",
    status: "submitted",
    steps: [
      { id: "s1", title: "Profile", description: "Personal information", completed: true },
      { id: "s2", title: "Destination", description: "Country & university", completed: true },
      { id: "s3", title: "Academic", description: "Education history", completed: true },
      { id: "s4", title: "Programs", description: "Program selection", completed: true },
      { id: "s5", title: "Documents", description: "Upload documents", completed: false },
      { id: "s6", title: "Review", description: "Final review", completed: false },
    ],
    personalInfo: {
      fullName: "Maria Garcia",
      dateOfBirth: "2001-07-22",
      nationality: "Spanish",
      phone: "+34 600 123 456",
    },
    academicInfo: {
      degree: "Bachelor of Science",
      gpa: "3.9",
      institution: "Universidad de Barcelona",
      graduationYear: "2025",
    },
    documents: ["transcript.pdf"],
    notes: "",
    createdAt: "2025-09-18",
    updatedAt: "2025-09-19",
  },
  {
    id: "app-3",
    studentId: "student-3",
    studentName: "James Chen",
    studentEmail: "james@student.com",
    universityId: "nus",
    universityName: "National University of Singapore",
    countryName: "Singapore",
    status: "accepted",
    steps: [
      { id: "s1", title: "Profile", description: "Personal information", completed: true },
      { id: "s2", title: "Destination", description: "Country & university", completed: true },
      { id: "s3", title: "Academic", description: "Education history", completed: true },
      { id: "s4", title: "Programs", description: "Program selection", completed: true },
      { id: "s5", title: "Documents", description: "Upload documents", completed: true },
      { id: "s6", title: "Review", description: "Final review", completed: true },
    ],
    personalInfo: {
      fullName: "James Chen",
      dateOfBirth: "2000-11-08",
      nationality: "Chinese",
      phone: "+86 138 0000 1234",
    },
    academicInfo: {
      degree: "Bachelor of Computer Science",
      gpa: "3.95",
      institution: "Tsinghua University",
      graduationYear: "2024",
    },
    documents: ["transcript.pdf", "passport.pdf", "recommendation.pdf", "portfolio.pdf"],
    notes: "Accepted to Computer Science program. Scholarship eligible.",
    createdAt: "2025-08-01",
    updatedAt: "2025-09-01",
  },
];

export const defaultPromotions: Promotion[] = [
  {
    id: "promo-1",
    title: "Early Bird Application",
    description: "Apply before January 2026 and get free document verification.",
    discount: "Free verification",
    active: true,
    startDate: "2025-09-01",
    endDate: "2026-01-31",
  },
  {
    id: "promo-2",
    title: "STEM Excellence Scholarship",
    description: "Up to 25% tuition support for top STEM applicants.",
    discount: "25% tuition",
    active: true,
    startDate: "2025-09-01",
    endDate: "2026-06-30",
  },
];

export const defaultEmailCampaigns: EmailCampaign[] = [
  {
    id: "email-1",
    subject: "Welcome to Neom — Start Your Application Journey",
    body: "Dear student, welcome to NEMP! Our AI assistant is ready to guide you...",
    status: "sent",
    recipients: 1240,
    sentAt: "2025-09-01",
    createdAt: "2025-08-28",
  },
  {
    id: "email-2",
    subject: "New Universities Added — Explore 8 Partner Institutions",
    body: "We've added new partner universities in Germany, Singapore, and UAE...",
    status: "scheduled",
    recipients: 890,
    createdAt: "2025-09-18",
  },
];

export const APPLICATION_STEPS = [
  { id: "profile", title: "Profile", description: "Your personal information" },
  { id: "destination", title: "Destination", description: "Country & university selection" },
  { id: "academic", title: "Academic", description: "Education & credentials" },
  { id: "programs", title: "Programs", description: "Degree & specialization" },
  { id: "documents", title: "Documents", description: "Required uploads" },
  { id: "review", title: "Review & Submit", description: "Final confirmation" },
];
