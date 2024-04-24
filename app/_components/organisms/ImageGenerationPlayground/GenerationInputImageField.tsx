'use client'
import { useEffect, useState } from "react"
import { ImageActionButton } from "../../molecules/GeneratedImageActions"
import Garbage from "../../icons/garbage"
import { Image } from "@nextui-org/react"
import { UploadButton } from "../../molecules/ImageFileUploader"



const GenerationInputImageField = ({ generationInputImage, setGenerationInputImage }: { generationInputImage: string | null, setGenerationInputImage: (image: string | null) => void }) => {
    const [inputImageUploadError, setInputImageUploadError] = useState(false)

    //Reset error if input image changes
    useEffect(() => {
        setInputImageUploadError(false)
    }, [generationInputImage])


    return (
        <div className="flex flex-col mr-auto">
            <p className="text-large font-normal mb-2">Input image <span className="text-danger">*</span></p>
            {window && !generationInputImage && <UploadButton
                appearance={
                    {
                        button: "mr-auto",
                        allowedContent: "mr-auto",
                        clearBtn: "mr-auto"
                    }
                }
                content={{ button: "Upload image" }}
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                    setGenerationInputImage(res[0].url)
                }}
                onUploadError={(error: Error) => {
                    setInputImageUploadError(true)//TODO: Add logic to display the error message
                }}
            />}
            {
                generationInputImage && <div className="relative flex">
                    <Image
                        src={generationInputImage}
                        alt="Input image"
                        classNames={{
                            img: "object-contain max-w-full max-h-[300px]"
                        }}
                    />
                    <div className="absolute bottom-2 right-2 z-20">
                        <ImageActionButton icon={<Garbage />} onClick={() => { setGenerationInputImage(null) }} tooltip="Change the input image" />
                    </div>
                </div>
            }
        </div>
    )
}

export default GenerationInputImageField