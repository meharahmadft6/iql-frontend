"use client";
import DashboardLayout from "../../layout/student/DashboardLayout";
import StudyInterface from "../../../components/StudyInterface";

export default function StudyPage() {
  return (
    <DashboardLayout title="Start Studying">
      <StudyInterface />
    </DashboardLayout>
  );
}
