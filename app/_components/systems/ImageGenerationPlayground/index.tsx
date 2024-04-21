'use client'

import Image from "next/image"
import { Prediction } from "replicate"
import { useCallback, useEffect, useRef, useState } from "react"
import { generateImagePredictionAction, getPredictionsResponseAction } from "./serverComponents"

const IMAGE_GENERATION_ERROR_MESSAGES = {
    GENERAL: "Error generating the image, please try again"
}

const INPUT_NAMES = {
    PROMPT: "prompt"
}

export const ImageGenerationPlayground = () => {
    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [isFetchingPrediction, setIsFetchingPrediction] = useState(false)
    const [image, setImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const poolPredictionIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
                        setImage(predictionResponse.output[0])
                        setPrediction(null)
                        setIsFetchingPrediction(false)
                        clearPoolPredictionIntervalAndRemoveRef()
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


    console.log("generated Image", image)
    return <section className="flex flex-row w-[100%]">
        <div className="flex flex-col w-[400px]">
            <form className="flex flex-col space-y-4" action={onGenerationFormSubmit}>
                <label>
                    <span>Image prompt</span>
                    <input type="text" name={INPUT_NAMES.PROMPT} />
                </label>
                {<button type="submit" disabled={isFetchingPrediction}>
                    {isFetchingPrediction ? "Generating image..." : "Generate image"}
                </button>}
            </form>
        </div>
        <div className="flex flex-col w-[100%]">
            {image && <Image width={300} height={300} src={image} alt="Generated image" />}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    </section >
}

export default ImageGenerationPlayground
