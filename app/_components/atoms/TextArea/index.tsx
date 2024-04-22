import { TextAreaProps, Textarea as TextAreaNextUI } from '@nextui-org/react';
import React from 'react';


const TextArea: React.FC<TextAreaProps> = (props) => {
    return (
        <TextAreaNextUI
            isRequired
            classNames={{
                inputWrapper: "p-4",
                input: "text-large text-gray-800",
                label: "text-large mb-2"
            }}
            labelPlacement="outside"
            {...props}
        >
            {props.children}
        </TextAreaNextUI>
    );
}

export default TextArea;