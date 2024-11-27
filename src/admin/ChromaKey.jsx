// import React, { useRef, useEffect, useState } from 'react';
// import * as bodyPix from '@tensorflow-models/body-pix';
// import AdminShell from '../components/AdminShell';
// import { invoke } from '@tauri-apps/api/tauri';
// import { toast, ToastContainer } from 'react-toastify';
// // import { Image } from 'lucide-react';
// import back_img from '../assets/defaultImage.jpeg'
// import { useStore } from '../admin/store.js';

// const props = {
//     page: 'Chromakey',
//     type: 'chromakey'
// }

// export default function Chromakey() {

//     const { chromokeyStatus, setChromokeyStatus } = useStore();

//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [isModelReady, setModelReady] = useState(false);
//     const [net, setNet] = useState(null);
//     const [imageData, setImageData] = useState(null);
//     const [isLiveView, setIsLiveView] = useState(false);

//     const startLiveView = async () => {
//         try {
//             const response = await invoke('start_live_view');
//             console.log(response);
//             // setCaptureStatus(response);
//             setIsLiveView(true);
//         } catch (error) {
//             toast.error('Ошибка запуска live-view');
//             console.error('Failed to initialize camera:', error);
//             // setCaptureStatus(`Error: ${error.toString()}`);
//         }
//     };

//     useEffect(() => {
//         const initializeCamera = async () => {
//             try {
//                 const response = await invoke('initialize_camera');
//                 // console.log(response);
//                 // setCameraStatus(response);
//             } catch (error) {
//                 console.error('Failed to initialize camera:', error);
//                 toast.error('Ошибка инициализации камеры');
//                 // setCameraStatus(`Error: ${error.toString()}`);
//             }
//         };

//         // const startLiveView = async () => {
//         //     try {
//         //         const response = await invoke('start_live_view');
//         //         // console.log(response);
//         //         // setCaptureStatus(response);
//         //         setIsLiveView(true);
//         //     } catch (error) {
//         //         console.error('Failed to initialize camera:', error);
//         //         // setCaptureStatus(`Error: ${error.toString()}`);
//         //     }
//         // };

//         initializeCamera();
//         if(!isLiveView) {
//             // setIsCameraReady(true)
//             startLiveView();
//         }
//     }, []);


//     useEffect(() => {
//         // const setupCamera = async () => {
//         // const video = videoRef.current;
//         // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         // video.srcObject = stream;
//         // startLiveView();
//         // return new Promise((resolve) => {
//         //     video.onloadedmetadata = () => {
//         //     video.play();
//         //     resolve(video);
//         //     };
//         // });
//         // };

//         const loadModel = async () => {
//         const model = await bodyPix.load();
//         setNet(model);
//         setModelReady(true);
//         };

//         // setupCamera();
//         startLiveView();
//         loadModel();
//     }, []);

//     useEffect(() => {
//         let animationFrameId;
    
//         const updateLiveView = async () => {
//             try {
//                 const base64Image = await invoke('download_ev_image_command');
//                 setImageData(base64Image);
//             } catch (err) {
//                 console.error('Ошибка получения нового кадра', err);
//             }
//             animationFrameId = requestAnimationFrame(updateLiveView);
//         };
    
//         if (isLiveView) {
//             updateLiveView();
//         }
    
//         return () => cancelAnimationFrame(animationFrameId);
//     }, [isLiveView]);
    
//     // const img = new Image();

//     const processVideo = async () => {
//         if (!isModelReady || !canvasRef.current || !imageData) return;
    
//         const hiddenCanvas = document.createElement('canvas');
//         const ctxHidden = hiddenCanvas.getContext('2d');
//         const visibleCanvas = canvasRef.current;
//         const ctxVisible = visibleCanvas.getContext('2d');
    
//         const img = new Image();
//         img.src = `${imageData}`;

        


//         img.onload = async () => {
//             try {
                
//                 hiddenCanvas.width = visibleCanvas.width;
//                 hiddenCanvas.height = visibleCanvas.height;
    
//                 ctxHidden.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
//                 ctxHidden.drawImage(img, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
    
//                 const segmentation = await net.segmentPerson(hiddenCanvas, {
//                     flipHorizontal: false,
//                     internalResolution: "medium",
//                     segmentationThreshold: 0.6, // 0.6 nice
//                 });
    
//                 const mask = segmentation.data;
//                 const imageData = ctxHidden.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
//                 const pixel = imageData.data;
    
//                 for (let i = 0; i < pixel.length; i += 4) {
//                     if (mask[i / 4] === 0) {
//                         pixel[i + 3] = 0;
//                     }
//                 }
    
//                 ctxHidden.putImageData(imageData, 0, 0);
//                 // const back = new Image();
//                 // back.src = back_img;
//                 // back.onload = () => {
//                 //     ctxVisible.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
//                 //     ctxVisible.drawImage(back, 0, 0, visibleCanvas.width, visibleCanvas.height);
//                 //     // ctxVisible.drawImage(img, 0, 0, visibleCanvas.width, visibleCanvas.height);
//                 // }
//                 // back.onload();
            
//                 // Быстро обновляем видимый canvas
//                 ctxVisible.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
//                 ctxVisible.drawImage(hiddenCanvas, 0, 0);

//             } catch (err) {
//                 console.error("Ошибка обработки изображения:", err);
//             }
//         };
//     };
    
    
//     useEffect(() => {
//         let animationFrameId;
    
//         const processVideoLoop = async () => {
//             await processVideo();
//             animationFrameId = requestAnimationFrame(processVideoLoop);
//         };
    
//         if (isModelReady && net && imageData) {
//             processVideoLoop();
//         }
    
//         return () => cancelAnimationFrame(animationFrameId);
//     }, [isModelReady, net, imageData]);
    
//     // useEffect(() => {
//     //     const interval = setInterval(processVideo, 50); // Обновляем каждые 100 мс
//     //     return () => clearInterval(interval);
//     // }, [isModelReady, net, imageData]);
    


//     return (
//         <AdminShell props={props}>
//             {/* <video
//                 ref={videoRef}
//                 style={{ display: 'none' }}
//                 width="640"
//                 height="480"
//             ></video> */}
//             <div>
//                 <div>
//                     {chromokeyStatus && <canvas ref={canvasRef} width="700" height="500"></canvas>}
//                     {!chromokeyStatus && <img src={imageData} alt="" />}
//                 </div>
//                 <div>
//                     <button onClick={() => setChromokeyStatus(!chromokeyStatus)}>Toggle</button>
//                 </div>
//             </div>
//             <ToastContainer />
//         </AdminShell>
//     )
// }


















import React, { useRef, useEffect, useState } from 'react';
import * as bodyPix from '@tensorflow-models/body-pix';
import AdminShell from '../components/AdminShell';
import { invoke } from '@tauri-apps/api/tauri';
import { toast, ToastContainer } from 'react-toastify';
import back_img from '../assets/defaultImage.jpeg'; // Фоновое изображение
import overlay_img from '../components/images_for_template/rule.png'; // Изображение объекта (например, рамки)

const props = {
    page: 'Chromakey',
    type: 'chromakey',
};

export default function Chromakey() {
    const videoCanvasRef = useRef(null); // Для фото
    const backgroundCanvasRef = useRef(null); // Для фона
    const overlayCanvasRef = useRef(null); // Для объекта
    const [isModelReady, setModelReady] = useState(false);
    const [net, setNet] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [isLiveView, setIsLiveView] = useState(false);

    const startLiveView = async () => {
        try {
            const response = await invoke('start_live_view');
            setIsLiveView(true);
        } catch (error) {
            toast.error('Ошибка запуска live-view');
            console.error('Failed to initialize camera:', error);
        }
    };

    useEffect(() => {
        const initializeCamera = async () => {
            try {
                await invoke('initialize_camera');
            } catch (error) {
                console.error('Failed to initialize camera:', error);
                toast.error('Ошибка инициализации камеры');
            }
        };

        initializeCamera();
        if (!isLiveView) {
            startLiveView();
        }
    }, []);

    useEffect(() => {
        const loadModel = async () => {
            const model = await bodyPix.load();
            setNet(model);
            setModelReady(true);
        };

        startLiveView();
        loadModel();
    }, []);

    useEffect(() => {
        const drawStaticBackground = () => {
            const backgroundCanvas = backgroundCanvasRef.current;
            const ctx = backgroundCanvas.getContext('2d');
            const img = new Image();
            img.src = back_img;

            img.onload = () => {
                ctx.drawImage(img, 0, 0, backgroundCanvas.width, backgroundCanvas.height);
            };
        };

        const drawOverlayObject = () => {
            const overlayCanvas = overlayCanvasRef.current;
            const ctx = overlayCanvas.getContext('2d');
            const img = new Image();
            img.src = overlay_img;

            img.onload = () => {
                ctx.drawImage(img, 0, 0, overlayCanvas.width, overlayCanvas.height);
            };
        };

        drawStaticBackground();
        drawOverlayObject();
    }, []);

    useEffect(() => {
        let animationFrameId;
    
        const updateLiveView = async () => {
            try {
                const base64Image = await invoke('download_ev_image_command');
                setImageData(base64Image);
            } catch (err) {
                console.error('Ошибка получения нового кадра', err);
            }
            animationFrameId = requestAnimationFrame(updateLiveView);
        };
    
        if (isLiveView) {
            updateLiveView();
        }
    
        return () => cancelAnimationFrame(animationFrameId);
    }, [isLiveView]);

    const processVideo = async () => {
        if (!isModelReady || !videoCanvasRef.current || !imageData) return;

        const hiddenCanvas = document.createElement('canvas');
        const ctxHidden = hiddenCanvas.getContext('2d');
        const videoCanvas = videoCanvasRef.current;
        const ctxVideo = videoCanvas.getContext('2d');

        const img = new Image();
        img.src = `${imageData}`;

        img.onload = async () => {
            try {
                hiddenCanvas.width = videoCanvas.width;
                hiddenCanvas.height = videoCanvas.height;

                ctxHidden.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
                ctxHidden.drawImage(img, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

                const segmentation = await net.segmentPerson(hiddenCanvas, {
                    flipHorizontal: false,
                    internalResolution: 'medium',
                    segmentationThreshold: 0.6,
                });

                const mask = segmentation.data;
                const imageData = ctxHidden.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
                const pixel = imageData.data;

                for (let i = 0; i < pixel.length; i += 4) {
                    if (mask[i / 4] === 0) {
                        pixel[i + 3] = 0;
                    }
                }

                ctxHidden.putImageData(imageData, 0, 0);

                ctxVideo.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
                ctxVideo.drawImage(hiddenCanvas, 0, 0);
            } catch (err) {
                console.error('Ошибка обработки изображения:', err);
            }
        };
    };

    useEffect(() => {
        let animationFrameId;

        const processVideoLoop = async () => {
            await processVideo();
            animationFrameId = requestAnimationFrame(processVideoLoop);
        };

        if (isModelReady && net && imageData) {
            processVideoLoop();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isModelReady, net, imageData]);

    return (
        <AdminShell props={props}>
            <div style={{ position: 'relative', width: 700, height: 500 }}>
                <canvas ref={backgroundCanvasRef} width="700" height="500" style={{ position: 'absolute', zIndex: 1 }} />
                <canvas ref={videoCanvasRef} width="700" height="500" style={{ position: 'absolute', zIndex: 2 }} />
                <canvas ref={overlayCanvasRef} width="700" height="500" style={{ position: 'absolute', zIndex: 3 }} />
            </div>
            <ToastContainer />
        </AdminShell>
    );
}



















// import React, { useRef, useEffect, useState } from 'react';
// import * as bodyPix from '@tensorflow-models/body-pix';
// import AdminShell from '../components/AdminShell';
// import { invoke } from '@tauri-apps/api/tauri';
// import { toast, ToastContainer } from 'react-toastify';

// const props = {
//     page: 'Chromakey',
//     type: 'chromakey'
// };

// export default function Chromakey() {
//     const canvasRef = useRef(null);
//     const [isModelReady, setModelReady] = useState(false);
//     const [net, setNet] = useState(null);
//     const [imageData, setImageData] = useState(null);
//     const [isLiveView, setIsLiveView] = useState(false);
//     const [processingQueue, setProcessingQueue] = useState(false); // Контролируем очередь обработки.

//     // Запуск live view
//     const startLiveView = async () => {
//         try {
//             await invoke('start_live_view');
//             setIsLiveView(true);
//         } catch (error) {
//             toast.error('Ошибка запуска live-view');
//             console.error('Failed to initialize live-view:', error);
//         }
//     };

//     // Инициализация камеры
//     useEffect(() => {
//         const initializeCamera = async () => {
//             try {
//                 await invoke('initialize_camera');
//                 startLiveView();
//             } catch (error) {
//                 toast.error('Ошибка инициализации камеры');
//                 console.error('Failed to initialize camera:', error);
//             }
//         };

//         if (!isLiveView) {
//             initializeCamera();
//         }
//     }, [isLiveView]);

//     // Загрузка модели BodyPix
//     useEffect(() => {
//         const loadModel = async () => {
//             const model = await bodyPix.load();
//             setNet(model);
//             setModelReady(true);
//         };

//         if (!net) {
//             loadModel();
//         }
//     }, [net]);

//     // Обновление изображения с камеры
//     useEffect(() => {
//         let animationFrameId;

//         const fetchFrame = async () => {
//             try {
//                 const base64Image = await invoke('download_ev_image_command');
//                 setImageData(base64Image);
//             } catch (error) {
//                 console.error('Ошибка получения нового кадра:', error);
//             }
//             animationFrameId = requestAnimationFrame(fetchFrame);
//         };

//         if (isLiveView) {
//             fetchFrame();
//         }

//         return () => cancelAnimationFrame(animationFrameId);
//     }, [isLiveView]);

//     // Обработка кадра
//     const processFrame = async () => {
//         if (!isModelReady || !imageData || processingQueue) return;

//         setProcessingQueue(true);

//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         const img = new Image();
//         img.src = `${imageData}`;

//         img.onload = async () => {
//             try {
//                 const { width, height } = img;
//                 canvas.width = width;
//                 canvas.height = height;

//                 // Отрисовка на canvas
//                 ctx.clearRect(0, 0, width, height);
//                 ctx.drawImage(img, 0, 0, width, height);

//                 // Сегментация
//                 const segmentation = await net.segmentPerson(canvas, {
//                     flipHorizontal: false,
//                     internalResolution: 'medium',
//                     segmentationThreshold: 0.6,
//                 });

//                 const { data: mask } = segmentation;
//                 const imageData = ctx.getImageData(0, 0, width, height);
//                 const pixel = imageData.data;

//                 // Применение маски
//                 for (let i = 0; i < pixel.length; i += 4) {
//                     if (mask[i / 4] === 0) {
//                         pixel[i + 3] = 0; // Установка прозрачного фона
//                     }
//                 }

//                 ctx.putImageData(imageData, 0, 0);
//             } catch (error) {
//                 console.error('Ошибка обработки кадра:', error);
//             } finally {
//                 setProcessingQueue(false); // Снимаем блокировку обработки
//             }
//         };

//         img.onerror = () => {
//             console.error('Ошибка загрузки изображения.');
//             setProcessingQueue(false);
//         };
//     };

//     // Запуск обработки кадров
//     useEffect(() => {
//         const processLoop = () => {
//             processFrame();
//             requestAnimationFrame(processLoop);
//         };

//         if (isModelReady) {
//             processLoop();
//         }

//         return () => {}; // Очищать `requestAnimationFrame` не нужно, так как он должен работать до конца.
//     }, [isModelReady, imageData]);

//     return (
//         <AdminShell props={props}>
//             <canvas ref={canvasRef} width="700" height="500" style={{display: 'none'}}></canvas>
//             <img src={imageData} alt="" style={{ display: 'block' }} />
//             <ToastContainer />
//         </AdminShell>
//     );
// }
