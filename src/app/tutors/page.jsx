// No "use client" here – this stays a Server Component
import TeachersPageContent from "./TeachersPageContent";

export const metadata = {
  title: "Find Tutors | Infinity Quotient Learning",
  description:
    "Browse verified home tutors and online teachers at Infinity Quotient Learning. Connect with qualified tutors for personalized learning in any subject.",
  keywords: [
    "find tutors",
    "home tutors",
    "online tutors",
    "private teachers",
    "tutoring services",
    "best tutors near me",
    "Infinity Quotient Learning tutors",
    "qualified teachers",
  ],
  authors: [
    {
      name: "Infinity Quotient Learning",
      url: "https://infinityquotientlearning.com",
    },
  ],
  alternates: {
    canonical: "https://infinityquotientlearning.com/tutors",
  },
  openGraph: {
    title: "Find Tutors | Infinity Quotient Learning",
    description:
      "Explore a wide range of verified tutors for home and online learning. Connect with expert teachers and enhance your learning journey.",
    url: "https://infinityquotientlearning.com/tutors",
    siteName: "Infinity Quotient Learning",
    type: "website",
    images: [
      {
        url: "https://infinityquotientlearning.com/infinity.jpg",
        width: 1200,
        height: 630,
        alt: "Find Tutors - Infinity Quotient Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Tutors | Infinity Quotient Learning",
    description:
      "Discover qualified home and online tutors at Infinity Quotient Learning. Connect with expert teachers for personalized education.",
    images: ["https://infinityquotientlearning.com/infinity.jpg"],
    creator: "@InfinityQL",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function TutorsPage() {
  return <TeachersPageContent />;
}
