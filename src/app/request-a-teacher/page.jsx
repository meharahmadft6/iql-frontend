// No "use client" here – this stays a Server Component
import RequestTeacherPage from "./RequestTeacherPageContent";

export const metadata = {
  title: "Request a Tutor | Find Qualified Teachers Online & At Home",
  description:
    "Post your learning requirement on Infinity Quotient Learning and get matched with verified tutors. Find qualified teachers for academics, competitive exams, and skill development.",
  keywords: [
    "request a tutor",
    "find a teacher",
    "hire a tutor",
    "student requirements",
    "post tutoring job",
    "academic help",
    "online classes",
    "home tutor request",
    "Infinity Quotient Learning",
  ],
  alternates: {
    canonical: "https://infinityquotientlearning.com/request-a-teacher",
  },
  openGraph: {
    title: "Request a Tutor | Find Qualified Teachers Online & At Home",
    description:
      "Post your tutoring requirements and connect with expert teachers on Infinity Quotient Learning. Quick, verified, and affordable tutoring options for every subject.",
    url: "https://infinityquotientlearning.com/request-a-teacher",
    siteName: "Infinity Quotient Learning",
    type: "website",
    images: [
      {
        url: "https://infinityquotientlearning.com/infinity.jpg",
        width: 1200,
        height: 630,
        alt: "Request a Tutor - Infinity Quotient Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Tutor | Infinity Quotient Learning",
    description:
      "Students can post tutoring requirements and get matched with expert online and home tutors instantly on Infinity Quotient Learning.",
    images: ["https://infinityquotientlearning.com/infinity.jpg"],
    creator: "@InfinityQL",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TeachingJobsPage() {
  return <RequestTeacherPage />;
}
