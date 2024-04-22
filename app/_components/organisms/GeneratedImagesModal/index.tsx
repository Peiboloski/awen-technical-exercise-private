'use client'
import { GeneratedImageInterface, useGeneratedImages } from "@/app/_contexts/GeneratedImagesContext";
import { Button, Card, CardBody, Image, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import FolderIcon from "../../icons/foder";
import PhotoAlbum from "react-photo-album";



const GeneratedImagesModal: React.FC = () => {
    const [hasMounted, setHasMounted] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    //avoid rendering on the server as it leads to hydratation error when loading the images from the local stroage
    useEffect(() => {
        setHasMounted(true);
    }, []);

    const { images = [] } = useGeneratedImages();

    if (!hasMounted) return null;

    return (
        <div>
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
            </Button>
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
                            <ModalBody>
                                <PhotoAlbum targetRowHeight={300} layout="rows" photos={images.map((image) => {
                                    return {
                                        src: image.url,
                                        width: image.dimensions.width,
                                        height: image.dimensions.height
                                    }

                                })} />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div >
    )
}

export default GeneratedImagesModal;