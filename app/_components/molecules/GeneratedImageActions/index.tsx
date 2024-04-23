'use client'
import { Button, Tooltip } from "@nextui-org/react";
import Download from "../../icons/download";
import Garbage from "../../icons/garbage";
import InputImage from "../../icons/inputImage";
import { useGeneratedImages } from "@/app/_contexts/GeneratedImagesContext";

type ActionInterface = {
    icon: JSX.Element,
    tooltip: string,
    hide?: boolean,
    onClick: () => void
}


const GeneratedImageActions = ({ url, name, isInPlayground }: { url: string, name: string, isInPlayground?: boolean }) => {
    const { removeImage, setGenerationInputImage } = useGeneratedImages();

    async function downloadImage({ url, name }: { url: string, name: string }) {
        try {
            const image = await fetch(url)
            const imageBlog = await image.blob()
            const imageURL = URL.createObjectURL(imageBlog)

            const link = document.createElement('a')
            link.href = imageURL
            link.download = name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
        }
    }

    const actions = [
        {
            icon: <InputImage />,
            tooltip: "Generate image with this one as input",
            onClick: () => {
                setGenerationInputImage(url)
            }
        },
        {
            icon: <Garbage />,
            tooltip: "Delete this image",
            hide: isInPlayground,
            onClick: () => removeImage(url)
        },
        {
            icon: <Download />,
            tooltip: "Download this image",
            onClick: () => downloadImage({ url, name })
        },
    ] satisfies ActionInterface[]
    return (
        <div className="absolute bottom-2 right-2 z-20 flex flex-row gap-2">
            {actions.map((action, index) => (
                <ImageActionButton key={index}  {...action} />
            ))}
        </div>
    )
}


const ImageActionButton = ({ hide, icon, onClick, tooltip }: ActionInterface) => {
    if (hide) {
        return null;
    }

    return (
        <Tooltip content={tooltip} className="dark">
            <Button className="bg-foreground-600 bg-opacity-30 backdrop-blur text-foreground-50 hover:bg-opacity-100" isIconOnly startContent={icon} onClick={onClick} />
        </Tooltip>
    );
};

export { ImageActionButton, GeneratedImageActions };