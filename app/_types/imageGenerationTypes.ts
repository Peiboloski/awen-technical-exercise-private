interface GenerateImagePredictionInputInterfaceExposed {
    width: number,
    height: number,
    prompt: string,
}

interface GenerateImagePredictionInputInterface extends GenerateImagePredictionInputInterfaceExposed {
    refine: string,
    apply_watermark?: boolean,
    num_inference_steps: number,
    scheduler?: string,
    guidance_scale?: number,
    high_noise_frac?: number,
    negative_prompt?: string,
    prompt_strength?: number
}

enum GenerationTypes {
    IMAGE,
    IMAGE_TO_IMAGE
}

export type { GenerateImagePredictionInputInterface, GenerateImagePredictionInputInterfaceExposed }

//Export enums
export { GenerationTypes }