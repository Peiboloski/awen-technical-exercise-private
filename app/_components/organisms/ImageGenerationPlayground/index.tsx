'use client'

import { Prediction } from "replicate"
import { useEffect, useRef, useState } from "react"
import { generateImagePredictionAction, getPredictionsResponseAction } from "./serverComponents"
import { Button, Card, CardBody, Image, Input, Spinner, Tabs, Tab, CardHeader } from "@nextui-org/react"
import classNames from "classnames"
import CountUp from 'react-countup';
import TextArea from "../../atoms/TextArea"
import { Radio, RadioGroup } from "../../atoms/Radio"
import { useGeneratedImages } from "@/app/_contexts/GeneratedImagesContext"
import { GeneratedImageActions, ImageActionButton } from "../../molecules/GeneratedImageActions"
import { GenerateImagePredictionInputInterfaceExposed, GenerationTypes } from "@/app/_types/imageGenerationTypes"
import { UploadButton } from "../../molecules/ImageFileUploader"
import Garbage from "../../icons/garbage"

const IMAGE_GENERATION_ERROR_MESSAGES = {
    GENERAL: "Error generating the image, please try again"
}

const INPUT_NAMES = {
    PROMPT: "prompt",
    INPUT_IMAGE: "inputImage",
    DIMENSIONS: "dimensions",
    STYLE: "style"
}

const resolutions = {
    "1:1": {
        value: "1:1",
        width: 1024 / 2,
        height: 1024 / 2,
        drawingStyles: "w-[20px] h-[20px]",
    },
    "4:5": {
        value: "4:5",
        width: 1024 / 2,
        height: 1280 / 2,
        drawingStyles: "w-[16px] h-[20px]"

    },
    "2:3": {
        value: "2:3",
        width: 1024 / 2,
        height: 1536 / 2,
        drawingStyles: "w-[14px] h-[21px]"
    },
    "4:7": {
        value: "4:7",
        width: 1024 / 2,
        height: 1792 / 2,
        drawingStyles: "w-[12px] h-[21px]"
    },
    "5:4": {
        value: "5:4",
        width: 1280 / 2,
        height: 1024 / 2,
        drawingStyles: "w-[25px] h-[20px]"
    }
    ,
    "3:2": {
        value: "3:2",
        width: 1536 / 2,
        height: 1024 / 2,
        drawingStyles: "w-[30px] h-[20px]"
    }
    ,
    "7:4": {
        value: "7:4",
        width: 1792 / 2,
        height: 1024 / 2,
        drawingStyles: "w-[35px] h-[20px]"
    },
} satisfies Record<string, { value: string, width: number, height: number, drawingStyles?: string }>

const imageStyles: Record<string, { value: string, promtStart: string }> = {
    "photorealism": {
        value: "photorealism",
        promtStart: "A photorealistic image of ",
    },
    artistic: {
        value: "artistic",
        promtStart: "An artistic image of ",
    },
    sketch: {
        value: "sketch",
        promtStart: "A sketch of ",
    },
    unset: {
        value: "unset",
        promtStart: "",
    }
}

export const ImageGenerationPlayground = () => {
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [predictionInput, setPredictionInput] = useState<GenerateImagePredictionInputInterfaceExposed | null>(null)
    const [isFetchingPrediction, setIsFetchingPrediction] = useState(false)
    const [image, setImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const poolPredictionIntervalRef = useRef<NodeJS.Timeout | null>(null)

    //Selected Tab
    const [selectedGenerationType, setSelectedGenerationType] = useState<GenerationTypes>(GenerationTypes.IMAGE)

    //Images persistent state context
    const { addImage: addToAllGeneratedImagesArray, generationInputImage, setGenerationInputImage } = useGeneratedImages()

    //Form fields state
    const [prompt, setPrompt] = useState<string | null>(null)
    const [inputImageUploadError, setInputImageUploadError] = useState<boolean | null>(null)

    const clearPoolPredictionIntervalAndRemoveRef = () => {
        if (poolPredictionIntervalRef.current) {
            clearInterval(poolPredictionIntervalRef.current)
            poolPredictionIntervalRef.current = null
        }
    }

    //When a prediction is being generated, pool the prediction response
    useEffect(() => {
        if (prediction && isFetchingPrediction && !poolPredictionIntervalRef.current) {
            poolPredictionIntervalRef.current = setInterval(async () => {
                try {
                    const predictionResponse = await getPredictionsResponseAction({ prediction })

                    if (predictionResponse.status === 'succeeded') {
                        handlePredictionSuccess(predictionResponse)
                    } else if (predictionResponse.status === "processing" || predictionResponse.status === "starting") {
                        console.log("Prediction is still processing", predictionResponse)
                        setPrediction(predictionResponse)
                    }

                    else if (predictionResponse.status === "failed" || predictionResponse.status === "canceled") {
                        handlePredictionFailure()
                    }
                } catch (error) {
                    handlePredictionFailure()
                }
            }, 1000)
        }

        const handlePredictionFailure = () => {
            setError(IMAGE_GENERATION_ERROR_MESSAGES.GENERAL)
            setPrediction(null)
            setIsFetchingPrediction(false)
            clearPoolPredictionIntervalAndRemoveRef()
        }

        const handlePredictionSuccess = (predictionResponse: Prediction) => {
            setImage(predictionResponse.output[0])
            addToAllGeneratedImagesArray({
                url: predictionResponse.output[0],
                dimensions: {
                    width: predictionInput?.width || resolutions["1:1"].width,
                    height: predictionInput?.height || resolutions["1:1"].height

                }
            })
            setPrediction(null)
            setIsFetchingPrediction(false)
            clearPoolPredictionIntervalAndRemoveRef()
        }

    }, [prediction, isFetchingPrediction, poolPredictionIntervalRef, predictionInput, addToAllGeneratedImagesArray])

    //Clear the ongoing prediction pool interval if the component is unmounted
    useEffect(() => {
        return () => {
            if (poolPredictionIntervalRef.current) {
                clearInterval(poolPredictionIntervalRef.current)
            }
        }
    }, [])


    const onGenerationFormSubmit = async (formData: FormData) => {
        setIsFetchingPrediction(true)
        setError(null)
        setImage(null)
        try {
            const prompt = formData.get(INPUT_NAMES.PROMPT) as string
            const promptStart = imageStyles[formData.get(INPUT_NAMES.DIMENSIONS) as string].promtStart || ""
            const { height, width } = resolutions[formData.get(INPUT_NAMES.STYLE) as keyof typeof resolutions] || resolutions["1:1"]
            const userInput = {
                prompt: promptStart + prompt,
                height,
                width,
                image: selectedGenerationType == GenerationTypes.IMAGE_TO_IMAGE ? generationInputImage : undefined
            }

            setPredictionInput(userInput)
            const prediction = await generateImagePredictionAction({ userInput, type: selectedGenerationType })
            setPrediction(prediction)
        } catch (error) {
            setError(IMAGE_GENERATION_ERROR_MESSAGES.GENERAL)
            setIsFetchingPrediction(false)
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
                            {(selectedGenerationType == GenerationTypes.IMAGE_TO_IMAGE) && <div className="flex flex-col mr-auto">
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
                                        setInputImageUploadError(true)
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
                            </div>}
                            <TextArea
                                type="text"
                                label="Image description"
                                name={INPUT_NAMES.PROMPT}
                                placeholder="Describe the image that you want to generate"
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <RadioGroup defaultValue={imageStyles["photorealism"].value} isRequired
                                label="Style" name={INPUT_NAMES.DIMENSIONS}
                            >
                                {Object.entries(imageStyles).map(([key, value]) => (
                                    <Radio key={key} value={key}>
                                        <span className="text-large">{value.value}</span>
                                    </Radio>
                                ))}
                            </RadioGroup>
                            <RadioGroup defaultValue={resolutions["1:1"].value} isRequired
                                label="Resolution" name={INPUT_NAMES.STYLE}>
                                {Object.entries(resolutions).map(([key, value]) => (
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
            {image &&
                <div className="mt-auto ml-auto relative">
                    <Image
                        classNames={{
                            wrapper: "h-[100%] overflow-hidden display-flex flex-col justify-end",
                            img: "object-contain max-w-full max-h-full mt-auto ml-auto"

                        }
                        }
                        width={
                            predictionInput?.width || resolutions["1:1"].width
                        }
                        height={
                            predictionInput?.height || resolutions["1:1"].height
                        }
                        src={image}
                        alt="Generated image">
                    </Image>
                    <GeneratedImageActions isInPlayground url={image} name={prompt || "Generated image"} />
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
            {error && <p className="text-red-500 text-xl font-semibold mx-auto my-auto">{error}</p>}
        </div>
    </section >
}

export default ImageGenerationPlayground
