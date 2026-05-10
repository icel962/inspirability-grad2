"use client";

import { useParams } from "next/navigation";
import ProfileDetailsPage from "@/app/components/shared/ProfileDetailsPage";

export default function SportDetailsPage() {
  const params = useParams();

  return <ProfileDetailsPage kind="sport" id={params.id} />;
}
