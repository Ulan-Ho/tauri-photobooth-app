import React, { useRef, useEffect, useCallback } from "react";
import AdminShell from "../components/AdminShell";
import { useStore } from "./store";
import { SaveIcon, ArrowBigUpDash } from "lucide-react";
import backgroundUrl from "../assets/defaultImage.jpeg";
import { invoke } from '@tauri-apps/api/tauri';
import { ToastContainer } from "react-toastify";
import { usePageNavigation } from '../App.jsx';
import { drawCromakeyBackgroundImage } from '../components/CanvasDrawer.jsx'

const props = { page: 'Chromakey', type: 'chromakey' };

export default function Chromakey() {
    const { chromokeyStatus, updateCameraStatus, updateLiveViewStatus, cameraStatus, isLiveView, chromokeyBackgroundImage, setChromokeyStatus, setChromokeyBackgroundImage } = useStore();
    const canvasRef = useRef(null);
    const backgroundImageRef = useRef(null);
    usePageNavigation();

    useEffect(() => {
        if (!chromokeyBackgroundImage.src) return;

        const bgCanvas = backgroundImageRef.current;
        const bgCtx = bgCanvas.getContext("2d");
        bgCanvas.width = 530;
        bgCanvas.height = 530;
        drawCromakeyBackgroundImage(bgCtx, bgCanvas, chromokeyBackgroundImage, true)

        // backgr.onerror = (err) => console.error('Ошибка загрузки фона:', err);
    }, [chromokeyBackgroundImage]);

    const processVideoFrames = useCallback((base64Image) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const image = new Image();
        image.src = base64Image;

        image.onload = () => {
            canvas.width = 530;
            canvas.height = 530;
            const canvasAspect = canvas.width / canvas.height;
            const imageAspect = image.width / image.height;

            let drawWidth, drawHeight, offsetX, offsetY;

            // Рассчитываем размеры и смещения для "object-cover"
            if (imageAspect > canvasAspect) {
                // Изображение шире, чем канвас
                drawWidth = canvas.height * imageAspect;
                drawHeight = canvas.height;
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                // Изображение выше, чем канвас
                drawWidth = canvas.width;
                drawHeight = canvas.width / imageAspect;
                offsetX = 0;
                offsetY = (canvas.height - drawHeight) / 2;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

            if (chromokeyStatus) {
                const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = frame.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    if (g > 100 && r < 100 && b < 100) data[i + 3] = 0;
                }

                ctx.putImageData(frame, 0, 0);
            }
        };

        image.onerror = (err) => console.error('Ошибка загрузки изображения:', err);
    }, [chromokeyStatus]);

    useEffect(() => {
        if (!isLiveView) return;

        const interval = setInterval(async () => {
            try {
                const base64Image = await invoke('download_ev_image_command');
                processVideoFrames(base64Image);
            } catch (err) {
                console.error('Ошибка загрузки кадра:', err);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isLiveView, processVideoFrames]);

    const toggleLiveView = useCallback(async () => {
        if (!cameraStatus) {
            await invoke('initialize_camera');
            updateCameraStatus(true);
        }
        if (isLiveView) {
            await invoke('stop_live_view');
            updateLiveViewStatus(false);
        } else {
            await invoke('start_live_view');
            updateLiveViewStatus(true);
        }
    }, [cameraStatus, isLiveView]);

    // Обработчик для изменения фона
    const handleBackgroundChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target.result;
            const imageObject = new Image();
            imageObject.src = imageSrc;
            // Обновляем состояние с новым изображением
            setChromokeyBackgroundImage(imageObject, imageSrc);
            console.log(chromokeyBackgroundImage.scr);
        };
        reader.readAsDataURL(file);
    };

    const saveBackground = async () => {
        try {
            await invoke('save_background', { image: chromokeyBackgroundImage?.src });
            console.log('Фон успешно сохранён');
        } catch (err) {
            console.error('Ошибка сохранения фона:', err);
        }
    };
    
    const updateBackground = async () => {
        try {
            const background = await invoke('get_background');
            if (background) {
                const imageObject = new Image();
                imageObject.src = background;
                setChromokeyBackgroundImage(imageObject, background);
            }
        } catch (err) {
            console.error('Ошибка загрузки фона:', err);
        }
    };
    

    return (
        <AdminShell props={props}>
            <div className="flex h-full">
                <div className="relative w-3/5 h-full">
                    <canvas ref={backgroundImageRef} width="530" height="530" style={{ position: 'absolute', zIndex: 1, display: chromokeyStatus === true ? 'block' : 'none' }} />
                    <canvas ref={canvasRef} width="530" height="530" style={{ position: 'absolute', zIndex: 2 }} />
                </div>
                <div className="flex flex-col justify-between w-2/5" style={{ height: '530px' }}>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                        <button className={`p-2 rounded-lg border ${isLiveView === true ? 'bg-blue-500' : 'bg-red-500'} text-white`} onClick={toggleLiveView}>Включить камеру</button>
                        <button className={`p-2 rounded-lg border ${chromokeyStatus === true ? 'bg-blue-500' : 'bg-red-500'} text-white`} onClick={() => setChromokeyStatus(!chromokeyStatus)}>Chromakey {chromokeyStatus === true ? 'включен' : 'выключен'}</button>
                        <div
                            className="rounded-lg border flex justify-center items-center cursor-pointer col-span-2 w-fit h-fit"
                            style={{ overflow: 'hidden', background: '#f3f3f3' }}
                        >
                            <label style={{ width: '370px', height: '370px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {chromokeyBackgroundImage.src ? (
                                    <img
                                        className="object-cover w-full h-full"
                                        src={chromokeyBackgroundImage.src}
                                        alt="Сохранённый фон"
                                    />
                                ) : (
                                    <p>Кликните для выбора фона</p>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleBackgroundChange} 
                                    className="hidden" // Скрываем input
                                />
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button className="flex bg-green-500 text-white p-2 rounded-lg" onClick={saveBackground}><SaveIcon />Сохранить фон</button>
                        <button className="flex bg-yellow-500 text-white p-2 rounded-lg" onClick={updateBackground}><ArrowBigUpDash />Обновить</button>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </AdminShell>
    );
}
