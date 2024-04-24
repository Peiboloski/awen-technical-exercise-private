import { useEffect, useState, useRef, useCallback } from "react";
import { getPredictionsResponseAction, generateImagePredictionAction } from '../serverActions';
import { Prediction } from "replicate";
import { GenerateImagePredictionInputInterfaceExposed, GenerationTypes } from "@/app/_types/imageGenerationTypes";
import { IMAGE_GENERATION_ERROR_MESSAGES } from "../constants";
import { useGeneratedImages } from "@/app/_contexts/GeneratedImagesContext";


const useImagesPrediction = () => {

    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [predictionInput, setPredictionInput] = useState<GenerateImagePredictionInputInterfaceExposed | null>(null);
    const [isFetchingPrediction, setIsFetchingPrediction] = useState(false);
    const [imagePredicted, setImagePredicted] = useState<string | null>(null);
    const [imagePredictionError, setImagePredictionError] = useState<string | null>(null);
    const poolPredictionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const { addImage: addToAllGeneratedImagesArray } = useGeneratedImages()

    const clearPoolPredictionIntervalAndRemoveRef = () => {
        if (poolPredictionIntervalRef.current) {
            clearInterval(poolPredictionIntervalRef.current);
            poolPredictionIntervalRef.current = null;
        }
    };

    const handlePredictionFailure = useCallback(() => {
        setImagePredictionError(IMAGE_GENERATION_ERROR_MESSAGES.GENERAL); //TODO: Make error more specific
        setPrediction(null);
        setIsFetchingPrediction(false);
        clearPoolPredictionIntervalAndRemoveRef();
    }, []);

    const handlePredictionSuccess = useCallback((predictionResponse: Prediction) => {
        setImagePredicted(predictionResponse.output[0]);
        setPrediction(null);
        setIsFetchingPrediction(false);
        clearPoolPredictionIntervalAndRemoveRef();

        //Save the generated Image
        addToAllGeneratedImagesArray({
            url: predictionResponse.output[0],
            dimensions: {
                width: predictionInput?.width || 300,
                height: predictionInput?.height || 300
            }
        });

    }, [predictionInput, addToAllGeneratedImagesArray]);

    //This effect handles the prediction pooling process
    // when a nex prediction has been requested
    useEffect(() => {

        //Starts the pooling precess if a new prediciton is being fetched
        //and there is no pooling interval running yet 
        if (prediction && isFetchingPrediction && !poolPredictionIntervalRef.current) {
            poolPredictionIntervalRef.current = setInterval(async () => {
                try {
                    const predictionResponse = await getPredictionsResponseAction({ prediction });

                    if (predictionResponse.status === 'succeeded') {
                        handlePredictionSuccess(predictionResponse);
                    } else if (predictionResponse.status === 'processing' || predictionResponse.status === 'starting') {
                        setPrediction(predictionResponse);
                    } else if (predictionResponse.status === 'failed' || predictionResponse.status === 'canceled') {
                        handlePredictionFailure();
                    }
                } catch (error) {
                    handlePredictionFailure();
                }
            }, 1000);
        }
    }, [prediction, isFetchingPrediction, poolPredictionIntervalRef, predictionInput, handlePredictionSuccess, handlePredictionFailure]);


    //Clear the pooling interval when the component is unmounted
    //If there is a pooling interval running
    useEffect(() => {
        return () => {
            if (poolPredictionIntervalRef.current) {
                clearInterval(poolPredictionIntervalRef.current);
            }
        };
    }, []);

    const startNewImagePrediction = async ({
        userInput,
        type
    }: {
        userInput: GenerateImagePredictionInputInterfaceExposed,
        type?: GenerationTypes
    }) => {
        try {
            setIsFetchingPrediction(true);
            setImagePredictionError(null);
            setImagePredicted(null);
            setPredictionInput(userInput);
            const prediction = await generateImagePredictionAction({ userInput, type });
            setPrediction(prediction);
        } catch (error) {
            handlePredictionFailure();
        }
    };

    return { imagePredicted, startNewImagePrediction, imagePredictionError, isFetchingPrediction, predictionInput };
}

export default useImagesPrediction;