import classNames from "classnames";
import ImageGenerationPlayground from "./_components/organisms/ImageGenerationPlayground";
import GeneratedImagesModal from "./_components/organisms/GeneratedImagesModal";

export default async function Home() {
  return (
    <main className={
      classNames(
        "flex h-screen flex-col items-center justify-between p-12 max-w-screen-2xl mx-auto",
        "max-md:h-[unset] max-md:p-4 max-md:min-h-screen"
      )
    }>
      <div className={
        classNames(
          "flex flex-row w-full justify-end mb-6",
          "max-md:mb-4"
        )
      }
      >
        <GeneratedImagesModal />
      </div>
      <div className="w-full flex flex-col flex-1 overflow-auto"><ImageGenerationPlayground /></div>
    </main>
  );
}
