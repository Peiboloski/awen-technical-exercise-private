'use server'

import { generateImagePrediction, getPredictionResponse } from "@/app/lib/replicateStableDiffusion"
import { Prediction } from "replicate"

const generateImagePredictionAction = async ({ prompt }: { prompt: string }) => {
    try {
        const prediction: Prediction = await generateImagePrediction({ prompt })
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