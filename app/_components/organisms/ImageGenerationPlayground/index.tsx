'use client'

import { useState } from "react"
import { Button, Card, CardBody, Image, Spinner, Tabs, Tab, CardHeader } from "@nextui-org/react"
import classNames from "classnames"
import CountUp from 'react-countup';
import TextArea from "../../atoms/TextArea"
import { Radio, RadioGroup } from "../../atoms/Radio"
import { useGeneratedImages } from "@/app/_contexts/GeneratedImagesContext"
import { GeneratedImageActions } from "../../molecules/GeneratedImageActions"
import { GenerationTypes } from "@/app/_types/imageGenerationTypes"
import { IMAGE_STYLES, INPUT_NAMES, RESOLUTIONS } from "./constants"
import useImagesPrediction from "./hooks/useImagePrediction"
import GenerationInputImageField from "./GenerationInputImageField";

export const ImageGenerationPlayground = () => {
    const { imagePredictionError, imagePredicted, isFetchingPrediction, predictionInput, startNewImagePrediction } = useImagesPrediction()

    //Selected Tab
    const [selectedGenerationType, setSelectedGenerationType] = useState<GenerationTypes>(GenerationTypes.IMAGE)

    //Input image state (stored in context to be able to set it from other components)
    const { generationInputImage, setGenerationInputImage } = useGeneratedImages()

    //Form fields state
    const [prompt, setPrompt] = useState<string | null>(null)


    const onGenerationFormSubmit = async (formData: FormData) => {
        try {
            const prompt = formData.get(INPUT_NAMES.PROMPT) as string
            const promptStart = IMAGE_STYLES[formData.get(INPUT_NAMES.DIMENSIONS) as string].promtStart || ""
            const { height, width } = RESOLUTIONS[formData.get(INPUT_NAMES.STYLE) as keyof typeof RESOLUTIONS] || RESOLUTIONS["1:1"]
            const userInput = {
                prompt: promptStart + prompt,
                height,
                width,
                image: selectedGenerationType == GenerationTypes.IMAGE_TO_IMAGE ? generationInputImage : undefined
            }

            await startNewImagePrediction({ userInput, type: selectedGenerationType })
        } catch (error) {
            //Generation errors are handled by the useImagesPrediction hook
            //And the error is being returned using the error state vaiable
        }
    }


    const isButtonDisabled = isFetchingPrediction || !prompt

    return <section className={
        classNames(
            "flex flex-1 flex-row w-[100%] h-[100%] gap-6 overflow-auto",
            "max-md:flex-col"
        )
    }>
        <div className={
            classNames(
                "flex flex-col w-[600px] overflow-auto",
                "max-md:w-[100%]"
            )
        }>
            <Card classNames={
                {
                    base: "h-[100%] p-4",
                    body: "h-100%"
                }
            }>
                <CardHeader>
                    <Tabs
                        selectedKey={selectedGenerationType}
                        onSelectionChange={(key) => setSelectedGenerationType(key as GenerationTypes)}
                        classNames={
                            {
                                tab: "text-base font-emerald-600 font-medium  p-5 m-1",
                                cursor: "bg-emerald-100",
                            }
                        }
                    >
                        <Tab key={GenerationTypes.IMAGE} title="Text to Image">
                        </Tab>
                        <Tab key={GenerationTypes.IMAGE_TO_IMAGE} title="Image to Image">
                        </Tab>
                    </Tabs>
                </CardHeader>
                <CardBody className="h-[100%] relative">
                    <form className="flex flex-col justify-between gap-6 h-[100%]" action={onGenerationFormSubmit}>
                        <div className="space-y-6 mr-auto flex flex-col">
                            {(selectedGenerationType == GenerationTypes.IMAGE_TO_IMAGE) && <GenerationInputImageField generationInputImage={generationInputImage} setGenerationInputImage={setGenerationInputImage} />}
                            <TextArea
                                type="text"
                                label="Image description"
                                name={INPUT_NAMES.PROMPT}
                                placeholder="Describe the image that you want to generate"
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <RadioGroup defaultValue={IMAGE_STYLES["photorealism"].value} isRequired
                                label="Style" name={INPUT_NAMES.DIMENSIONS}
                            >
                                {Object.entries(IMAGE_STYLES).map(([key, value]) => (
                                    <Radio key={key} value={key}>
                                        <span className="text-large">{value.value}</span>
                                    </Radio>
                                ))}
                            </RadioGroup>
                            <RadioGroup defaultValue={RESOLUTIONS["1:1"].value} isRequired
                                label="Resolution" name={INPUT_NAMES.STYLE}>
                                {Object.entries(RESOLUTIONS).map(([key, value]) => (
                                    <Radio key={key} value={key}>
                                        <div className="flex items-center">
                                            <span className="mr-1">{key}</span>
                                            <div className={
                                                classNames(
                                                    "ml-2 bg-foreground-300",
                                                    value.drawingStyles
                                                )
                                            }></div>
                                        </div>
                                    </Radio>
                                ))}
                            </RadioGroup>

                        </div>
                        <div className="flex flex-col bg-background sticky bottom-[-20px] z-20 w-[100%] py-4">
                            <Button isDisabled={isButtonDisabled} className="p-6 text-large mt-auto" color="primary" type="submit" disabled={isButtonDisabled}>
                                {isFetchingPrediction ? "Generating image..." : "Generate image"}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
        <div className="flex flex-col w-[100%] h-[100%] justify-end">
            {imagePredicted &&
                <div className="mt-auto ml-auto h-[100%] relative">
                    <Image
                        classNames={{
                            wrapper: "h-[100%] overflow-hidden display-flex flex-col justify-end",
                            img: "object-contain max-w-full max-h-full mt-auto ml-auto"

                        }
                        }
                        src={imagePredicted}
                        alt="Generated image">
                    </Image>
                    <GeneratedImageActions isInPlayground url={imagePredicted} name={prompt || "Generated image"} />
                </div>
            }
            {isFetchingPrediction &&
                <div className="m-auto flex flex-row gap-4">
                    <Spinner size="lg" />
                    <p className="text-xl text-default-700 mx-auto my-auto">
                        <CountUp start={0} decimals={1} end={1000} duration={1000} />s
                    </p>
                </div>
            }
            {imagePredictionError && <p className="text-red-500 text-xl font-semibold mx-auto my-auto">{imagePredictionError}</p>}
        </div>
    </section >
}

export default ImageGenerationPlayground
