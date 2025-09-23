import { getUser } from "@/shared/api/auth/functions";
import { Dashboard, LandingPage } from "./entities/home/ui";

export default async function Home() {
  const { name, error } = await getUser();

  if (error || !name) {
    return <LandingPage />;
  }

  return (
    <div className="h-screen gap-4">
      <Dashboard name={name} />
    </div>
  );
}
