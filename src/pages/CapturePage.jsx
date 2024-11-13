import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import '../App.css';
import templateTriangle from '../assets/templateTriangle.png';
import cameraCapture from '../assets/cameraCapture.png';
import { usePageNavigation } from '../App.jsx';
import back_img from '../assets/defaultImage.jpeg';  // ПОМЕНЯТЬ НА СВОЙ ФОН

export default function CaptureScreen({ onCapture, template, setCanvas }) {
    const [bgImage, setBgImage] = useState(localStorage.getItem("back_3") || `url(${back_img})`);
    usePageNavigation();

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [isShooting, setIsShooting] = useState(false);
    const [images, setImages] = useState([]);
    const navigate = useNavigate();
    const [imageData, setImageData] = useState(null);
    const [isLiveView, setIsLiveView] = useState(false);

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

    const templateCanvas = async() => {
        const response = await invoke('load_available_canvas_data');
        const id = 1;
        const templates = [];
        response.map((item) => {
            templates.push({
                id: id,
                canvas: item
            });
        })

        templates.map((item) => {
            if (item.id === template) {
                setCanvas(item.canvas);
            }
        })
    }

    const startLiveView = async () => {
        try {
            const response = await invoke('start_live_view');
            // console.log(response);
            // setCaptureStatus(response);
            setIsLiveView(true);
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            // setCaptureStatus(`Error: ${error.toString()}`);
        }
    };

    useEffect(() => {
        const initializeCamera = async () => {
            try {
                const response = await invoke('initialize_camera');
                console.log(response);
                // setCameraStatus(response);
            } catch (error) {
                console.error('Failed to initialize camera:', error);
                // setCameraStatus(`Error: ${error.toString()}`);
            }
        };

        const startLiveView = async () => {
            try {
                const response = await invoke('start_live_view');
                console.log(response);
                // setCaptureStatus(response);
                setIsLiveView(true);
            } catch (error) {
                console.error('Failed to initialize camera:', error);
                // setCaptureStatus(`Error: ${error.toString()}`);
            }
        };

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
            await invoke('stop_live_view'); // Остановка live view
            setIsLiveView(!isLiveView);
            const base64Image = await invoke('capture_photo_as'); // Вызов команды на съемку фото
            listen("capture_image_from_base64", (event) => {
                setCapturedImage(`data:image/jpeg;base64,${event.payload}`);
            });
            console.log("Захвачено фото:", base64Image);
            // setCapturedImage(base64Image);
            setIsShooting(false);
        } catch (err) {
            console.log("Ошибка захвата фото:", err);
        }
    }, []);

    // Обработка обратного отсчета перед съемкой
    const startCountdown = useCallback(() => {
        // templateCanvas();
        // navigate('/print');
        if(!isLiveView) {
            setIsCameraReady(true)
            startLiveView();
        }
        setIsShooting(true);
        let timer = 3;
        setCountdown(timer);

        const intervalId = setInterval(() => {
            timer -= 1;
            setCountdown(timer);

            if (timer === 0) {
                stop
                clearInterval(intervalId);
                capture();
            }
        }, 1000);
    }, [capture]);

    // Сохранение фото
    const savePhoto = useCallback(() => {
        const newImage = {
            id: new Date().getTime(),
            name: `photo-${new Date().getTime()}`,
            url: capturedImage
        };
        setImages(prevImages => [...prevImages, newImage]);
        setCapturedImage(null);

        if (images.length < 2) {
            startCountdown();
        } else {
            onCapture([...images, newImage]);
            navigate('/print');
        }
    }, [capturedImage, images, navigate, onCapture, startCountdown]);

    // Пересъемка фото
    const reshootPhoto = useCallback(() => {
        setCapturedImage(null);
        startCountdown();
    }, [startCountdown]);

    return (
        <div className="flex justify-center items-center">
            <div className="select-none relative bg-cover bg-center bg-no-repeat" style={{ width: '1280px', height: '1024px', backgroundImage: bgImage }}>
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    <div className='flex w-screen justify-center items-center'>
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
