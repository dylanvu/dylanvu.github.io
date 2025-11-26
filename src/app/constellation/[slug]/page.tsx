import { CONSTELLATIONS } from "@/components/star-revamp/Star/ConstellationList";
import ConstellationPageInitializer from "./ConstellationPageInitializer";

export async function generateStaticParams() {
  return CONSTELLATIONS.map(constellation => ({
    slug: constellation.name.toLowerCase()
  }));
}

export default async function ConstellationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  return <ConstellationPageInitializer slug={slug} />;
}
