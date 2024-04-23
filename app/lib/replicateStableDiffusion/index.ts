'server-only'
import { GenerateImagePredictionInputInterface, GenerateImagePredictionInputInterfaceExposed, GenerationTypes } from "@/app/_types/imageGenerationTypes";
import Replicate from "replicate";


const STABILITY_AI_SDXL_MODEL = "stability-ai/sdxl";
const STABILITY_AI_SDXL_MODEL_VERSION = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

const BASE_INPUT = {
    [GenerationTypes.IMAGE]: {
        width: 768,
        height: 768,
        prompt: "An astronaut riding a rainbow unicorn",
        refine: "expert_ensemble_refiner",
        apply_watermark: false,
        num_inference_steps: 25
    },
    [GenerationTypes.IMAGE_TO_IMAGE]: {
        width: 1024,
        height: 1024,
        prompt: "A rainbow coloured monk",
        refine: "expert_ensemble_refiner",
        scheduler: "KarrasDPM",
        guidance_scale: 7.5,
        high_noise_frac: 0.8,
        prompt_strength: 0.65,
        num_inference_steps: 50
    }
} satisfies Record<GenerationTypes, GenerateImagePredictionInputInterface>


let replicateInstance: Replicate | null = null;

const getReplicateInstance = () => {
    if (replicateInstance === null) {
        try {
            replicateInstance = new Replicate();
        } catch (error) {
            console.error("Error creating replicate Instance", error)
            throw new Error("Error creating replicate Instance")
        }
    }
    return replicateInstance;
}

interface generateImagePredictionInterface {
    userInput: Partial<GenerateImagePredictionInputInterfaceExposed>,
    type: GenerationTypes
}
const generateImagePrediction = async ({ userInput, type }: generateImagePredictionInterface) => {
    let replicate = getReplicateInstance();
    const input = {
        ...BASE_INPUT[type],
        ...userInput
    };
    let prediction

    try {
        console.log("Getting image prediction")
        prediction = await replicate.predictions.create({ model: STABILITY_AI_SDXL_MODEL, input, version: STABILITY_AI_SDXL_MODEL_VERSION });
        console.log("Image prediction generated")
        return prediction;
    } catch (error) {
        console.error("Error getting image prediction:", error)
        throw new Error("Error getting image prediction")
    }
}

const getPredictionResponse = async ({ predictionId }: { predictionId: string }) => {
    let replicate = getReplicateInstance();
    try {
        const response = await replicate.predictions.get(predictionId);
        return response;
    } catch (error) {
        console.error("Error getting image for prediction: ", error)
        throw new Error("Error getting image for prediction")
    }
}



export { generateImagePrediction, getPredictionResponse }