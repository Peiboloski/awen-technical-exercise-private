'use client'

import { Prediction } from "replicate"
import { useCallback, useEffect, useRef, useState } from "react"
import { generateImagePredictionAction, getPredictionsResponseAction } from "./serverComponents"
import { Button, Card, CardBody, Image, Input, Radio, RadioGroup, Select, Spinner, Textarea } from "@nextui-org/react"
import classNames from "classnames"
import { GenerateImagePredictionInputInterfaceExposed } from "@/app/lib/replicateStableDiffusion"
import CountUp from 'react-countup';

const IMAGE_GENERATION_ERROR_MESSAGES = {
    GENERAL: "Error generating the image, please try again"
}

const INPUT_NAMES = {
    PROMPT: "prompt",
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

    //Form fields state
    const [prompt, setPrompt] = useState<string | null>(null)

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
            setPrediction(null)
            setIsFetchingPrediction(false)
            clearPoolPredictionIntervalAndRemoveRef()
        }

    }, [prediction, isFetchingPrediction, poolPredictionIntervalRef])

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
            const input = {
                prompt: promptStart + prompt,
                height,
                width
            }

            setPredictionInput(input)
            console.log("Input", input)
            const prediction = await generateImagePredictionAction(input)
            setPrediction(prediction)
        } catch (error) {
            setError(IMAGE_GENERATION_ERROR_MESSAGES.GENERAL)
            setIsFetchingPrediction(false)
        }
    }


    const isButtonDisabled = isFetchingPrediction || !prompt

    return <section className={
        classNames(
            "flex flex-row w-[100%] h-[100%] jus gap-6",
            "max-md:flex-col"
        )
    }>
        <div className={
            classNames(
                "flex flex-col w-[600px] h-[100%]",
                "max-md:w-[100%]"
            )
        }>
            <Card classNames={
                {
                    base: "h-[100%] p-4",
                    body: "h-100%"
                }
            }>
                <CardBody className="h-[100%]">
                    <form className="flex flex-col justify-between gap-6 h-[100%]" action={onGenerationFormSubmit}>
                        <div className="space-y-6">
                            <Textarea isRequired classNames={{
                                inputWrapper: "p-4",
                                input: "text-large text-gray-800",
                                label: "text-large mb-2"
                            }}
                                labelPlacement="outside"
                                type="text"
                                label="Image description"
                                name={INPUT_NAMES.PROMPT}
                                placeholder="Describe the image that you want to generate"
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <RadioGroup defaultValue={imageStyles["photorealism"].value} isRequired
                                label="Style" name={INPUT_NAMES.DIMENSIONS} classNames={{
                                    wrapper: "flex flex-row wrap gap-6",
                                    label: "text-large mb-2 text-gray-800",
                                }} >
                                {Object.entries(imageStyles).map(([key, value]) => (
                                    <Radio key={key} value={key}>
                                        <span className="text-large">{value.value}</span>
                                    </Radio>
                                ))}
                            </RadioGroup>
                            <RadioGroup defaultValue={resolutions["1:1"].value} isRequired
                                label="Resolution" name={INPUT_NAMES.STYLE} classNames={{
                                    wrapper: "flex flex-row wrap gap-6",
                                    label: "text-large mb-2 text-gray-800",
                                }} >
                                {Object.entries(resolutions).map(([key, value]) => (
                                    <Radio key={key} value={key}>
                                        <div className="flex items-center">
                                            <span className="text-large mr-1">{key}</span>
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
                        <div className="flex flex-col bg-background sticky bottom-[-20px] w-[100%] py-4">
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
                <Image
                    classNames={{
                        wrapper: "h-[100%] overflow-hidden",
                        img: "object-contain max-w-full max-h-full"

                    }
                    }
                    width={
                        predictionInput?.width || resolutions["1:1"].width
                    }
                    height={
                        predictionInput?.height || resolutions["1:1"].height
                    }
                    src={image}
                    alt="Generated image"
                />
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
