'use client'

import { Prediction } from "replicate"
import { useCallback, useEffect, useRef, useState } from "react"
import { generateImagePredictionAction, getPredictionsResponseAction } from "./serverComponents"
import { Button, Card, CardBody, Image, Input, Textarea } from "@nextui-org/react"
import classNames from "classnames"

const IMAGE_GENERATION_ERROR_MESSAGES = {
    GENERAL: "Error generating the image, please try again"
}

const INPUT_NAMES = {
    PROMPT: "prompt",
}

export const ImageGenerationPlayground = () => {
    const [prediction, setPrediction] = useState<Prediction | null>(null)
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
        try {
            const prompt = formData.get(INPUT_NAMES.PROMPT) as string
            const prediction = await generateImagePredictionAction({ prompt })
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
                        </div>
                        <div className="flex flex-col ">
                            <Button isDisabled={isButtonDisabled} className="p-6 text-large mt-auto" color="primary" type="submit" disabled={isButtonDisabled}>
                                {isFetchingPrediction ? "Generating image..." : "Generate image"}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
        <div className="flex flex-col w-[100%] h-[100%] justify-end">
            {image && <Image width={768} height={768} src={image} alt="Generated image" />}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    </section >
}

export default ImageGenerationPlayground
