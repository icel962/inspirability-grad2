"use client";

import { useParams } from "next/navigation";
import ProfileDetailsPage from "@/app/components/shared/ProfileDetailsPage";

export default function MedicalDetailsPage() {
  const params = useParams();

  return <ProfileDetailsPage kind="medical" id={params.id} />;
}
