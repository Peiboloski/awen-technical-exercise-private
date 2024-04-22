"use client"

import { createContext, useContext, useState } from "react"

interface GeneratedImage {
    url: string
    dimensions: {
        width: number,
        height: number
    }
}

const usePersistingState = <T extends unknown>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [state, setState] = useState<T>(() => {

        //Case for when the code is running in the server
        if (typeof window === 'undefined') return initialValue

        const persistedState = localStorage.getItem(key)
        if (persistedState) {
            return JSON.parse(persistedState)
        } else {
            localStorage.setItem(key, JSON.stringify(initialValue))
            return initialValue
        }
    })

    const setPersistedState = (value: T) => {
        setState(value)
        //Case for when the code is running in the server
        if (typeof window === 'undefined') return
        localStorage.setItem(key, JSON.stringify(value))
    }

    return [state, setPersistedState]
}


//Hook to manage the state of the generated images with persistance in local storage
const useGeneratedImagesState = () => {
    const [images, setImages] = usePersistingState<GeneratedImage[]>(`generatedImages`, []) || []
    const addImage = (image: GeneratedImage) => {
        setImages([...images, image])
    }
    const removeImage = (index: number) => {
        setImages(images.filter((value, elementIndex) => elementIndex !== index))
    }
    return { images, setImages, addImage, removeImage }
}

const GeneratedImagesContext = createContext<ReturnType<typeof useGeneratedImagesState> | null>(null)

//Hook to get the state and modifier functions from components
const useGeneratedImages = () => {
    const context = useContext(GeneratedImagesContext)
    if (!context) {
        throw new Error('useGeneratedImages must be used within a GeneratedImagesProvider')
    }
    return context
}

const GeneratedImagesProvider = ({ children }: { children: React.ReactNode }) => {
    return <GeneratedImagesContext.Provider value={useGeneratedImagesState()}>{children}</GeneratedImagesContext.Provider>
}

export { GeneratedImagesProvider, useGeneratedImages }