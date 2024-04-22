import {
    RadioGroupProps,
    RadioGroup as RadioGroupNextUI,
    Radio as RadioNextUI,
    RadioProps
} from '@nextui-org/react';
import React from 'react';


const RadioGroup: React.FC<RadioGroupProps> = (props) => {
    return (
        <RadioGroupNextUI
            isRequired
            classNames={{
                wrapper: "flex flex-row wrap gap-6",
                label: "text-large mb-2 text-gray-800",

            }}
            labelPlacement="outside"
            {...props}
        >
            {props.children}
        </RadioGroupNextUI>
    );
}

const Radio: React.FC<RadioProps> = (props) => {
    return (
        <RadioNextUI
            classNames={{
                label: "text-large",
            }}
            {...props}>
            {props.children}
        </RadioNextUI>
    );
}

export { RadioGroup, Radio }