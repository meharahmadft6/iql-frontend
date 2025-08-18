import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Infinity Quotient Learning | Find the Best Online Tutors & Teachers",
  description:
    "India's premier platform connecting students with expert tutors. Find qualified teachers for 100+ subjects, competitive exam preparation, and skill development. Better than TeacherOn with lower fees and verified educators.",
  keywords: [
    "online tutoring",
    "find tutors",
    "home tutors",
    "best alternative to TeacherOn",
    "Infinity Quotient Learning",
    "online teachers",
    "subject experts",
    "competitive exam coaching",
    "affordable tutoring",
  ],
  openGraph: {
    title:
      "Infinity Quotient Learning - Find the Best Online Tutors & Teachers",
    description:
      "Connect with verified tutors across 100+ subjects at competitive rates. Pakistan's most trusted tutoring platform.",
    url: "https://infinityquotientlearning.com",
    siteName: "Infinity Quotient Learning",
    images: [
      {
        url: "https://infinityquotientlearning.com/infinity.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Quotient Learning | Find the Best Online Tutors",
    description:
      "Better than TeacherOn - Verified tutors, lower fees, and 100% satisfaction guarantee",
    images: ["https://infinityquotientlearning.com/infinity.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
