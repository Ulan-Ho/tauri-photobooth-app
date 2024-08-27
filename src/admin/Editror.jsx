import React, { useState } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import bg from '../assets/firstMainBg.jpeg';

const HomeScreenEditor = () => {
    const [image, setImage] = useState(
        bg
    );

    const onChange = (cropper) => {
        console.log(cropper.getCoordinates(), cropper.getCanvas());
    };

    return (
        <Cropper
        style={{ width: '600px', height: '600px' }}
            src={image}
            onChange={onChange}
            className={'cropper'}
            stencilProps={{
                aspectRatio: 4/3,
                movable: false,
                resizable: false
            }}
        />
    );
};

export default HomeScreenEditor;