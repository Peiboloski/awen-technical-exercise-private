const IMAGE_GENERATION_ERROR_MESSAGES = {
    GENERAL: "Error generating the image, please try again"
}

const INPUT_NAMES = {
    PROMPT: "prompt",
    INPUT_IMAGE: "inputImage",
    DIMENSIONS: "dimensions",
    STYLE: "style"
}

const RESOLUTIONS = {
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

const IMAGE_STYLES: Record<string, { value: string, promtStart: string }> = {
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

export { IMAGE_GENERATION_ERROR_MESSAGES, INPUT_NAMES, RESOLUTIONS, IMAGE_STYLES }