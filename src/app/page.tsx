import { getUser } from "@/shared/api/auth/functions";
import { Dashboard, LandingPage } from "@/entities/home/ui";

export default async function Home() {
  const result = await getUser();
  const name = result?.name || null;
  const error = result?.error || null;

  if (error || !name) {
    return <LandingPage />;
  }

  return <Dashboard />;
}
