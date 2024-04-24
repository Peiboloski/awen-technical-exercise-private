'use server'

import { GenerateImagePredictionInputInterfaceExposed, GenerationTypes } from "@/app/_types/imageGenerationTypes"
import { generateImagePrediction, getPredictionResponse } from "@/app/lib/replicateStableDiffusion"
import { Prediction } from "replicate"

const generateImagePredictionAction = async ({ userInput, type = GenerationTypes.IMAGE }: { userInput: Partial<GenerateImagePredictionInputInterfaceExposed>, type?: GenerationTypes }) => {
    try {
        const prediction: Prediction = await generateImagePrediction({ userInput, type })
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