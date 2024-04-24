'use client'
import { useGeneratedImages } from "@/app/_contexts/GeneratedImagesContext";
import { Button, Image, Modal, ModalBody, ModalContent, ModalHeader, Tooltip, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import FolderIcon from "../../icons/foder";
import PhotoAlbum from "react-photo-album";
import type { RenderPhotoProps } from "react-photo-album";
import { GeneratedImageActions } from "../../molecules/GeneratedImageActions";



const GeneratedImagesModal: React.FC = () => {
    const [hasMounted, setHasMounted] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    //avoid rendering on the server as it leads to hydratation error when loading the images from the local stroage
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const { images = [] } = useGeneratedImages();

    if (!hasMounted) return null;

    const CustomRenderedImage = ({
        photo,
        imageProps: { alt, title, sizes, className, onClick },
        wrapperStyle,
    }: RenderPhotoProps) => {
        return (
            <div style={{ ...wrapperStyle, position: "relative" }} className="flex">
                <GeneratedImageActions url={photo.src} name={alt} />
                <Image
                    src={photo.src}
                    {...{ alt, title, sizes, className, onClick }}
                />
            </div>
        );
    }

    return (
        <div>
            {images && (images.length > 0) &&
                <Button
                    onClick={onOpen}
                    className={
                        "p-4 bg-emerald-200 text-emerald-900 font-normal"
                    }
                    size="lg"
                    variant="shadow"
                    startContent={<FolderIcon />}
                >
                    See {images.length} generated images
                </Button>}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                scrollBehavior={"inside"}
                size={"5xl"}
            >
                <ModalContent className="font-normal text-foreground">
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Generated Images
                            </ModalHeader>
                            <ModalBody className="mb-4">
                                <PhotoAlbum targetRowHeight={400} layout="rows" photos={images.map((image) => {
                                    return {
                                        src: image.url,
                                        width: image.dimensions.width,
                                        height: image.dimensions.height,
                                    }

                                })}
                                    renderPhoto={CustomRenderedImage} />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    )
}


export default GeneratedImagesModal;
