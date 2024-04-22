import classNames from "classnames";
import ImageGenerationPlayground from "./_components/systems/ImageGenerationPlayground";

export default async function Home() {
  return (
    <main className={
      classNames(
        "flex h-screen flex-row items-center justify-between p-24 max-w-screen-2xl mx-auto",
        "max-md:h-[unset]"
      )
    }>
      <ImageGenerationPlayground />
    </main>
  );
}
