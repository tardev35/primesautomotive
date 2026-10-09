import { LuxurySite } from "@/components/luxury-site";
import { getSiteContent } from "@/lib/wordpress-content";

export default async function Home() {
  return <LuxurySite content={await getSiteContent()} />;
}
