import ImageGenerationPlayground from "./_components/systems/ImageGenerationPlayground";

export default async function Home() {
  return (
    <main className="flex h-screen flex-row items-center justify-between p-24 max-w-screen-2xl mx-auto">
      <ImageGenerationPlayground />
    </main>
  );
}
