import { LuxurySite } from "@/components/luxury-site";
import { getSiteContent } from "@/lib/wordpress-content";

export const metadata = { title: "About us | PROM DRIVE", description: "Discover the thinking behind PROM DRIVE — considered car rental experiences for your journey." };
export default async function AboutPage() { return <LuxurySite page="about" content={await getSiteContent()} />; }
