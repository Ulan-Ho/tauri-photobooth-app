import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate  } from 'react-router-dom';
import Webcam from 'react-webcam';
import Layout from '../components/Layout2.jsx';
import '../App.css';
import templateTriangle from '../assets/templateTriangle.png';
import cameraCapture from '../assets/cameraCapture.png';


export default function CaptureScreen({ onCapture }) {
    const webcamRef = useRef(null);
    const [images, setImages] = useState([]);
    const navigate = useNavigate();
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [isShooting, setIsShooting] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        setIsShooting(false);
    }, []);

    const startCountdown = useCallback(() => {
        setIsShooting(true);
        let timer = 2;
        setCountdown(timer);

        const intervalId = setInterval(() => {
            timer -= 1;
            setCountdown(timer);

            if (timer === 0) {
                clearInterval(intervalId);
                capture(); // Используйте capture, который теперь определен как зависимость
            }
        }, 1000);
    }, [capture]); // Указываем capture как зависимость

    const savePhoto = useCallback(() => {
        const newImage = {
            id: new Date().getTime(),
            name: `photo-${new Date().getTime()}`,
            url: capturedImage
        }
        setImages(prevImages => [...prevImages, newImage]);
        setCapturedImage(null);
        if (images.length < 2) {
            startCountdown();
        } else {
            onCapture([...images, newImage]);
            navigate('/print');
        }
    }, [capturedImage, images, navigate, onCapture, startCountdown]);

    const reshootPhoto = useCallback(() => {
        setCapturedImage(null);
        startCountdown();
    }, [startCountdown]);

    useEffect(() => {
        const checkCameraStatus = setInterval(() => {
            if (webcamRef.current && webcamRef.current.video.readyState === 4) {
                setIsCameraReady(true);
                clearInterval(checkCameraStatus);
            }
        }, []);

        return () => clearInterval(checkCameraStatus);
    }, [webcamRef]); // Используйте webcamRef как зависимость


    return (
        <Layout>
            <div className='flex w-screen justify-center items-center'>
                <div className='flex flex-col gap-12 items-center px-20 w-full'>
                    <div className='text-5xl items-center text-center'>ЧТОБЫ СОЗДАТЬ ФОТО, <br /> НАЖМИТЕ НА КНОПКУ ПОД РАМКОЙ</div>
                    <div className='w-full'>
            {!capturedImage ? (
                <div className='flex flex-col items-center w-full gap-10'>
                    <div className='border-solid border-2 capture-container rounded-md' style={{ width: 530, height: 530, position: 'relative' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={530}
                            height={530}
                            videoConstraints={{ width: 530, height: 530, facingMode: 'user' }}
                            className='rounded-md'
                        />
                        {isShooting && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '100px',
                                fontWeight: 'bold',
                                color: 'white',
                                textShadow: '2px 2px 10px rgba(0, 0, 0, 0.7)'
                            }}>
                                {countdown}
                            </div>
                        )}
                    </div>
                    <div className='h-40 flex justify-between items-center w-full'>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={() => navigate('/template')}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                        <div className='flex justify-center items-center'>
                            {!isShooting && (
                                <button onClick={startCountdown}>
                                    <img src={cameraCapture} className='w-72' alt="Capture Photo" />
                                </button>
                            )}
                        </div>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' style={{ visibility: 'hidden' }}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                    </div>

                </div>
            ) : (
                <div className='flex flex-col items-center w-full gap-10'>
                    <img src={capturedImage} alt='Captured' style={{ width: 530, height: 530, position: 'relative' }} className='border-solid border-2 capture-container rounded-md' />
                    <div className='h-40 flex justify-between items-center w-full'>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={() => navigate('/template')}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                        <div className='flex justify-around items-center gap-20'>
                            <button className='text-red-700 border-2 rounded-3xl px-12 py-8 bg-white font-bold' onClick={reshootPhoto}><span className='text-5xl '>НЕТ</span><br />ПЕРЕСНЯТЬ ФОТО</button>
                            <button className='text-lime-500 border-2 rounded-3xl px-12 py-8 bg-white font-bold' onClick={savePhoto}><span className='text-5xl '>ДА</span><br />НРАВИТСЯ ФОТО</button>
                        </div>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' style={{ visibility: 'hidden' }}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                    </div>
                </div>
            )}
        </div>
                    {/* <div className='left-10 bottom-10 absolute'>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white' onClick={() => navigate('/template')}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                    </div> */}
                </div>
            </div>
        </Layout>
    )
}



{/* <div className='top_word'>Чтобы сделать фото, нажмите кнопку под рамкой!</div>

<div className='flex gap-32'>
    
    <div className='capture-container flex flex-col gap-5'>
        {!isCameraReady && (
            <ins className='absolute bg-gray-800 p-5 rounded-md z-10 w-80'>ИДЕТ ПОДКЛЮЧЕНИЕ ФОТОКАМЕРЫ</ins>
        )}
        {!capturedImage ? (
            <div className='flex flex-col items-center'>
            <div className='border-solid border-2 capture-container rounded-md' style={{ width: 500, height: 500, position: 'relative' }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={500}
                    height={500}
                    videoConstraints={{ width: 500, height: 500, facingMode: 'user' }}
                />
                {isShooting && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '100px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '2px 2px 10px rgba(0, 0, 0, 0.7)'
                    }}>
                        {countdown}
                    </div>
                )}
            </div>
            {!isShooting && <button><img src={cameraCapture} alt="Capture Photo" /></button>}
        </div>
            ) : (
                <div>
                    <img src={capturedImage} alt='captured' style={{ width: 500, height: 500 }} className='rounded-md' />
                    <div className='flex justify-around'>
                        <div className='yes_btn'><button onClick={savePhoto}>Да, нравиться</button></div>
                        <div className='no_btn'><button onClick={reshootPhoto}>Не нравиться</button></div>
                    </div>
                </div>
            )}
        </div>
    <div className='w-60'></div>
</div> */}


{/* <div className='flex flex-col mt-3 w-60 gap-5'>
    {images.map((image, index) => (
        <div key={index} className='mr-3'>
            <img src={image.url} alt={`screenshot=${index}`} style={{ width: 200, height: 200 }} className='rounded-md' />
        </div>
    ))}
</div> */}