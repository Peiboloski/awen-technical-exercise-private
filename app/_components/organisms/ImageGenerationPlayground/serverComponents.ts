'use server'

import { GenerateImagePredictionInputInterfaceExposed, generateImagePrediction, getPredictionResponse } from "@/app/lib/replicateStableDiffusion"
import { Prediction } from "replicate"

const generateImagePredictionAction = async (props: Partial<GenerateImagePredictionInputInterfaceExposed>) => {
    try {
        const prediction: Prediction = await generateImagePrediction(props)
        return prediction
    } catch (error) {
        throw new Error("Error generating image prediction")
    }
}

const getPredictionsResponseAction = async ({ prediction }: { prediction: Prediction }) => {
    try {
        const predictionResponse = await getPredictionResponse({ predictionId: prediction.id })
        return predictionResponse
    } catch (error) {
        throw new Error("Error generating image")
    }
}

export { generateImagePredictionAction, getPredictionsResponseAction }