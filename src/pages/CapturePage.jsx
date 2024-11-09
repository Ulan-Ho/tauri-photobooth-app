import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate  } from 'react-router-dom';
import '../App.css';
import templateTriangle from '../assets/templateTriangle.png';
import cameraCapture from '../assets/cameraCapture.png';
import { invoke } from '@tauri-apps/api/tauri';

export default function CaptureScreen({ onCapture }) {
    const webcamRef = useRef(null);
    const [images, setImages] = useState([]);
    const navigate = useNavigate();
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [isShooting, setIsShooting] = useState(false);

    const [image, setImage] = useState('');
    const liveViewStarted = useRef(false);

    const [takingPicture, setTakingPicture] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);
    
    const capture = useCallback(async () => {
        setTakingPicture(true);
        try {
            await invoke('take_photo');
            const image = await invoke('get_saved_image');
            if (image) {
                setCapturedImage(image);
            }    
        } catch (error) {
            console.error('Error capturing photo:', error);
        }
        removeImage("image_alltime_usable.jpg"); // Удаление изображение с памяти
        setTakingPicture(false);
    }, []);

    const startCountdown = useCallback(() => {
        // Проверяем, идет ли сейчас обратный отсчет
        if (isCountingDown || takingPicture) return;

        setIsShooting(true);
        setIsCountingDown(true);
        let timer = 3;
        setCountdown(timer);

        const intervalId = setInterval(() => {
            timer -= 1;
            setCountdown(timer);

            if (timer <= 0) {
                clearInterval(intervalId);
                setIsCountingDown(false);
                capture(); // Используйте capture, который теперь определен как зависимость
            }
        }, 1000);
    }, [capture, isCountingDown, takingPicture]); // Указываем capture как зависимость

    const reshootPhoto = useCallback(() => {
        setCapturedImage(null);
        startCountdown();
    }, [startCountdown]);

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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    const back_func = useCallback(() => {
        navigate('/template');
    }, [navigate]);
    // Удаление изображения
    async function removeImage(imageName) {
        try {
            await invoke("delete_image", { image_name: imageName });
            console.log(`Image ${imageName} deleted.`);
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    }
    

    useEffect( () => {
        const startLiveView = async () => {
            console.log('Live view started');
            try {
                if (!liveViewStarted.current){
                    await invoke('start_live_view');
                    console.log('Live view started');
                    liveViewStarted.current = true;
                }
            } catch (err) {
                console.error('Failed to start live view:', err);
            }
        };
        startLiveView(); // Запускаем один раз при загрузке компонента
        removeImage("image_alltime_usable.jpg");
        return () => {
            const cleanup = async () => {
                console.log('Live view stopped');
                await invoke('stop_camera');
            };
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (!takingPicture){
            const updateLiveView = async () => {
                try {
                    setIsCameraReady(true);
                    let base64Image = await invoke('get_image_base64'); // Вызываем backend для получения нового кадра
                    if (base64Image) {
                        setImage(`data:image/jpeg;base64,${base64Image}`);
                    }
                } catch (err) {
                    console.error('Failed to fetch image:', err);
                }
            };
            const interval = setInterval(updateLiveView, 100); // Обновляем изображение каждые 100 мс
            return () => clearInterval(interval); // Очищаем интервал при размонтировании компонента
        }
    }, [takingPicture]);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return (
        <div className="flex justify-center items-center">
            <div className="select-none relative" style={{width: '1280px', height: '1024px', backgroundImage: `url(src/assets/secondMainBg.jpeg)`}}>
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>

                    <div className='flex w-screen justify-center items-center'>
                    <div className='flex flex-col gap-12 items-center px-20 w-full'>
                        <div className='text-5xl items-center text-center'>ЧТОБЫ СОЗДАТЬ ФОТО, <br /> НАЖМИТЕ НА КНОПКУ ПОД РАМКОЙ</div>
                        <div className='w-full'>
                        {!isCameraReady && (
                <ins className='bg-gray-800 p-5 rounded-md z-10'style={{position:'absolute', top:'30%', left:'32%', height:'10%', textAlign:'center'}}>ИДЕТ ПОДКЛЮЧЕНИЕ ФОТОКАМЕРЫ</ins>
            )}
                {!capturedImage ? (
                    <div className='flex flex-col items-center w-full gap-10'>
                        <div className='border-solid border-2 capture-container rounded-md' style={{ width: 530, height: 530, position: 'relative' }}>
                            <img
                                src={image}
                                alt="Live View"
                                style={{ maxWidth: 530, height: 530 }}
                                className='object-cover'
                            />
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
                            <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={back_func}>
                                <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                            </button>
                            <div className='flex justify-center items-center'>
                                {!isShooting && (
                                    <button onClick={startCountdown} disabled={takingPicture || isCountingDown}>
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
                            <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={back_func}>
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
                    </div>
                </div>

                </div>
            </div>
        </div>
            
    )
}
