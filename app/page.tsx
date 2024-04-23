import classNames from "classnames";
import ImageGenerationPlayground from "./_components/organisms/ImageGenerationPlayground";
import GeneratedImagesModal from "./_components/organisms/GeneratedImagesModal";

export default async function Home() {
  return (
    <main className={
      classNames(
        "flex h-screen flex-col items-center justify-between p-16 max-w-screen-2xl mx-auto",
        "max-md:h-[unset] maxmd:p-4 max-md:min-h-screen"
      )
    }>
      <div className="flex flex-row w-full justify-end mb-6">
        <GeneratedImagesModal />
      </div>
      <div className="flex-grow w-full"><ImageGenerationPlayground /></div>
    </main>
  );
}
