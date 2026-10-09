import { LuxurySite } from "@/components/luxury-site";
import { getSiteContent } from "@/lib/wordpress-content";

export const metadata = { title: "Contact us | PROM DRIVE", description: "Plan your next journey with PROM DRIVE. Contact channels and information to prepare before enquiring." };
export default async function ContactPage() { return <LuxurySite page="contact" content={await getSiteContent()} />; }
