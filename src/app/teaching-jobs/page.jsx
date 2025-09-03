// No "use client" here – this stays a Server Component
import TeachingJobsContent from "./TeachingJobsContent";

export const metadata = {
  title: "Teaching Jobs | Infinity Quotient Learning",
  description:
    "Discover the latest verified home tutoring and online teaching jobs at Infinity Quotient Learning. Connect with students and grow your teaching career today.",
  keywords: [
    "teaching jobs",
    "home tutor jobs",
    "online tutor jobs",
    "teaching opportunities",
    "private tutor jobs",
    "tutoring vacancies",
    "teaching career",
    "Infinity Quotient Learning",
  ],
  authors: [
    {
      name: "Infinity Quotient Learning",
      url: "https://infinityquotientlearning.com",
    },
  ],
  alternates: {
    canonical: "https://infinityquotientlearning.com/teaching-jobs",
  },
  openGraph: {
    title: "Teaching Jobs | Infinity Quotient Learning",
    description:
      "Explore home tutor and online teaching job opportunities. Verified tutoring jobs to help you grow your teaching career with Infinity Quotient Learning.",
    url: "https://infinityquotientlearning.com/teaching-jobs",
    siteName: "Infinity Quotient Learning",
    type: "website",
    images: [
      {
        url: "https://infinityquotientlearning.com/infinity.jpg",
        width: 1200,
        height: 630,
        alt: "Teaching Jobs - Infinity Quotient Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teaching Jobs | Infinity Quotient Learning",
    description:
      "Find verified teaching and tutoring jobs online or at home. Infinity Quotient Learning connects tutors with students quickly.",
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

export default function TeachingJobsPage() {
  return <TeachingJobsContent />;
}
