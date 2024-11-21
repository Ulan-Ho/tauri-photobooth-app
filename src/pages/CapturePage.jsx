import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import '../App.css';
import templateTriangle from '../assets/templateTriangle.png';
import cameraCapture from '../assets/cameraCapture.png';
import { usePageNavigation } from '../App.jsx';
import back_img from '../assets/defaultImage.jpeg';  // ПОМЕНЯТЬ НА СВОЙ ФОН
import { useStore } from '../admin/store.js';

import test_image_1 from '../image_beta/IMG_6700.JPG';
import test_image_2 from '../image_beta/IMG_7107.JPG';
import test_image_3 from '../image_beta/IMG_7111.JPG';
import { toast } from 'react-toastify';

export default function CaptureScreen({ onCapture }) {
    const [bgImage, setBgImage] = useState(localStorage.getItem("back_3") || `url(${back_img})`);
    const { canvases, currentCanvasId, updateObjectProps } = useStore();
    const currentCanvas = canvases.find(canvas => canvas.id === currentCanvasId);
    const imagesLenght = currentCanvas.objects.filter(object => object.type === 'image' && object.src === '').reduce((max, obj) => Math.max(max, obj.numberImage), 0);
    usePageNavigation();

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [isShooting, setIsShooting] = useState(false);
    const [images, setImages] = useState([]);
    const navigate = useNavigate();
    const [imageData, setImageData] = useState(null);
    const [isLiveView, setIsLiveView] = useState(false);
    // const [cer, setCer] = useState(1);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const image = await invoke('get_image', { imageName: '3_bg.jpeg' });
                const url_image = `url(data:image/jpeg;base64,${image})`;
                setBgImage(url_image);
                localStorage.setItem("back_3", url_image);
            } catch (err) {
                console.log(err);
            }
        };
        if (!localStorage.getItem("back_3")) {
            fetchImage();
        } else {
            setBgImage(localStorage.getItem("back_3"));
        }
    }, []);

    const startLiveView = async () => {
        try {
            const response = await invoke('start_live_view');
            // console.log(response);
            // setCaptureStatus(response);
            setIsLiveView(true);
        } catch (error) {
            toast.error('Ошибка запуска live-view');
            console.error('Failed to initialize camera:', error);
            // setCaptureStatus(`Error: ${error.toString()}`);
        }
    };

    useEffect(() => {
        const initializeCamera = async () => {
            try {
                const response = await invoke('initialize_camera');
                // console.log(response);
                // setCameraStatus(response);
            } catch (error) {
                console.error('Failed to initialize camera:', error);
                toast.error('Ошибка инициализации камеры');
                // setCameraStatus(`Error: ${error.toString()}`);
            }
        };

        // const startLiveView = async () => {
        //     try {
        //         const response = await invoke('start_live_view');
        //         // console.log(response);
        //         // setCaptureStatus(response);
        //         setIsLiveView(true);
        //     } catch (error) {
        //         console.error('Failed to initialize camera:', error);
        //         // setCaptureStatus(`Error: ${error.toString()}`);
        //     }
        // };

        initializeCamera();
        if(!isLiveView) {
            setIsCameraReady(true)
            startLiveView();
        }
    }, []);

    useEffect(() => {
        const updateLiveView = async () => {
            try {
                const base64Image = await invoke('download_ev_image_command'); // Вызываем backend для получения нового кадра
              // setImage(`data:image/jpeg;base64,${base64Image}`);
                setImageData(base64Image);
            } catch (err) {
                toast.error('Ошибка получения нового кадра');
                // console.error('Failed to fetch image:', err);
                setError('Ошибка получения изображения');
            }
        };
        let interval;
        if (isLiveView) {
            interval = setInterval(updateLiveView, 80); // Обновляем изображение каждые 50 мс
        }
        return () => clearInterval(interval);
    }, [isLiveView])

    // Функция для захвата фото через Tauri
    const capture = useCallback(async () => {
        try {
            // await invoke('stop_live_view'); // Остановка live view
            // setIsLiveView(!isLiveView);
            const capture = await invoke('capture_photo_as'); // Вызов команды на съемку фото
            console.log(capture);
            const base64Image = await invoke('get_captured_image'); // Вызываем backend для получения нового кадра
            // if (images.length + 1 === 1) setCapturedImage(test_image_1);
            // if (images.length + 1 === 2) setCapturedImage(test_image_2);
            // if (images.length + 1 === 3) setCapturedImage(test_image_3);
            setCapturedImage(`data:image/jpeg;base64,${base64Image}`);
            // startLiveView();
            setIsShooting(false);
        } catch (err) {
            console.log("Ошибка захвата фото:", err);
        }
    }, [images]);

    
    // Обработка обратного отсчета перед съемкой
    const startCountdown = useCallback(() => {
        // navigate('/print');
        if(!isLiveView) {
            setIsCameraReady(true)
        }
        startLiveView();
        setIsShooting(true);
        let timer = 3;
        setCountdown(timer);
        // const cerRes = cer + 1;
        // setCer(cerRes);
        const intervalId = setInterval(() => {
            timer -= 1;
            setCountdown(timer);

            if (timer <= 0) {
                // stop
                clearInterval(intervalId);
                capture();
            }
        }, 1000);
    }, [capture]);

    // Сохранение фото
    const savePhoto = useCallback( async () => {
        const newImage = {
            id: new Date().getTime(),
            name: `photo-${new Date().getTime()}`,
            url: capturedImage
        };
        setImages(prevImages => [...prevImages, newImage]);
        setCapturedImage(null);

        if (images.length + 1 < imagesLenght) {
            startCountdown();
        } else {
            onCapture([...images, newImage]);
            navigate('/print');
            await invoke('stop_live_view');
        }
    }, [capturedImage, images, navigate, onCapture, startCountdown, imagesLenght]);

    // Пересъемка фото
    const reshootPhoto = useCallback(() => {
        setCapturedImage(null);
        startCountdown();
    }, [startCountdown]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            currentCanvas.objects.forEach(object => {
                if (object.type === 'image') {
                    console.log(images.length)
                    if (object.numberImage === 1 && images.length === 0) {
                        updateObjectProps(currentCanvasId, object.id, { src: capturedImage });
                    }
                    if (object.numberImage === 2 && images.length === 1) {
                        updateObjectProps(currentCanvasId, object.id, { src: capturedImage });
                    }
                    if (object.numberImage === 3 && images.length === 2) {
                        updateObjectProps(currentCanvasId, object.id, { src: capturedImage });
                    }
                }
            })
        }
    }, [capturedImage]);

    return (
        <div className="flex justify-center items-center">
            <div className="select-none relative bg-cover bg-center bg-no-repeat" style={{ width: '1280px', height: '1024px', backgroundImage: bgImage }}>
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    <div className='flex w-screen justify-center items-center'>
                        <canvas ref={canvasRef} width={1280} height={1024} style={{ display: 'none' }} />
                        <div className='flex flex-col gap-12 items-center px-20 w-full'>
                            <div className='text-5xl items-center text-center'>
                                ЧТОБЫ СОЗДАТЬ ФОТО, <br /> НАЖМИТЕ НА КНОПКУ ПОД РАМКОЙ
                            </div>
                            <div className='w-full'>
                                {!isCameraReady && (
                                    <ins className='bg-gray-800 p-5 rounded-md z-10' style={{ position: 'absolute', top: '30%', left: '32%', height: '10%', textAlign: 'center' }}>
                                        ИДЕТ ПОДКЛЮЧЕНИЕ ФОТОКАМЕРЫ
                                    </ins>
                                )}
                                {!capturedImage ? (
                                    <div className='flex flex-col items-center w-full gap-10'>
                                        <div className='border-solid border-2 capture-container rounded-md' style={{ width: 530, height: 530, position: 'relative' }}>
                                            {isCameraReady && (
                                                <img src={imageData} className='object-cover' style={{ width: 530, height: 530, position: 'relative' }}/>
                                            )}
                                            {isCameraReady && isShooting && (
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
                                        <img src={capturedImage} alt='Captured' style={{ width: 530, height: 530, position: 'relative' }} className='border-solid border-2 capture-container rounded-md object-cover' />
                                        <div className='h-40 flex justify-between items-center w-full'>
                                            <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={() => navigate('/template')}>
                                                <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                                            </button>
                                            <div className='flex justify-around items-center gap-20'>
                                                <button className='text-red-700 border-2 rounded-3xl px-12 py-8 bg-white font-bold' onClick={reshootPhoto}>
                                                    <span className='text-5xl '>НЕТ</span><br />ПЕРЕСНЯТЬ ФОТО
                                                </button>
                                                <button className='text-lime-500 border-2 rounded-3xl px-12 py-8 bg-white font-bold' onClick={savePhoto}>
                                                    <span className='text-5xl '>ДА</span><br />НРАВИТСЯ ФОТО
                                                </button>
                                            </div>
                                            <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' style={{ visibility: 'hidden' }}>
                                                <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}