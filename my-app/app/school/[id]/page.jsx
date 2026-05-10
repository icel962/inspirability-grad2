"use client";

import { useParams } from "next/navigation";
import ProfileDetailsPage from "@/app/components/shared/ProfileDetailsPage";

export default function SchoolDetailsPage() {
  const params = useParams();

  return <ProfileDetailsPage kind="school" id={params.id} />;
}
