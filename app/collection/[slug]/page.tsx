import CollectionPageClient from "@/components/collections/CollectionPageClient";

export default async function CollectionPage(context: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await context.params;
  return <CollectionPageClient slug={slug} />;
}
