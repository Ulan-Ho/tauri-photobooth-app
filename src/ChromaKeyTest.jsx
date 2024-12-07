// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// const HumanSegmentation = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
  
//   useEffect(() => {
//     const loadBodyPix = async () => {
//       const net = await bodyPix.load(); // Загружаем модель
//       const video = videoRef.current;

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//         video.play();
        
//         video.onloadeddata = () => {
//           segmentPerson(net);
//         };
//       } catch (err) {
//         console.error("Ошибка доступа к камере", err);
//       }
//     };

//     const segmentPerson = async (net) => {
//       const canvas = canvasRef.current;
//       const video = videoRef.current;
//       const ctx = canvas.getContext("2d");

//       const processFrame = async () => {
//         const segmentation = await net.segmentPerson(video, {
//           flipHorizontal: false,
//           internalResolution: "medium",
//           segmentationThreshold: 0.7, // Порог для сегментации
//         });

//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//         const { data: mask } = segmentation;

//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const pixel = imageData.data;

//         for (let i = 0; i < pixel.length; i += 4) {
//           const shouldHide = mask[i / 4] === 0; // Если маска равна 0, это не человек

//           if (shouldHide) {
//             pixel[i + 3] = 0; // Устанавливаем альфа-канал на 0 (прозрачность)
//           }
//         }

//         ctx.putImageData(imageData, 0, 0);
//         requestAnimationFrame(processFrame);
//       };

//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       processFrame();
//     };

//     loadBodyPix();
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} style={{ display: "none" }} />
//       <canvas ref={canvasRef} />
//     </div>
//   );
// };
//----------------------------------------------------------------Сверху без фона, внизу с фоном----------------------------------------------------------------
// // export default HumanSegmentation;
// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// const HumanSegmentation = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const backgroundImageRef = useRef(null);

//   useEffect(() => {
//     const loadBodyPix = async () => {
//       const net = await bodyPix.load(); // Загружаем модель
//       const video = videoRef.current;

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//         video.play();
        
//         video.onloadeddata = () => {
//           segmentPerson(net);
//         };
//       } catch (err) {
//         console.error("Ошибка доступа к камере", err);
//       }
//     };

//     const segmentPerson = async (net) => {
//       const canvas = canvasRef.current;
//       const video = videoRef.current;
//       const ctx = canvas.getContext("2d");

//       const processFrame = async () => {
//         const segmentation = await net.segmentPerson(video, {
//           flipHorizontal: false,
//           internalResolution: "medium",
//           segmentationThreshold: 0.7, // Порог для сегментации
//         });

//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // Добавляем изображение на фон
//         const backgroundImage = backgroundImageRef.current;
//         ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

//         // Рисуем видео поверх изображения
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//         const { data: mask } = segmentation;

//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const pixel = imageData.data;

//         for (let i = 0; i < pixel.length; i += 4) {
//           const shouldHide = mask[i / 4] === 0; // Если маска равна 0, это не человек

//           if (shouldHide) {
//             pixel[i + 3] = 0; // Устанавливаем альфа-канал на 0 (прозрачность)
//           }
//         }

//         ctx.putImageData(imageData, 0, 0);
//         requestAnimationFrame(processFrame);
//       };

//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       processFrame();
//     };

//     loadBodyPix();
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} style={{ display: "none" }} />
//       <canvas ref={canvasRef} />

//       {/* Прозрачное изображение на заднем плане */}
//       <img
//         ref={backgroundImageRef}
//         src="src/assets/firstMainBg.jpeg" // Ссылка на фон
//         alt="Background"
//         style={{ display: "none" }}
//       />
//     </div>
//   );
// };

// export default HumanSegmentation;



//----------------------------------------------------------------А тут для более точного ----------------------------------------------------------------
// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// const HumanSegmentation = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const backgroundImageRef = useRef(null);

//   useEffect(() => {
//     const loadBodyPix = async () => {
//       const net = await bodyPix.load({
//         // architecture: "ResNet50", // Более точная модель
//         architecture: "MobileNetV1", // Более быстрая модель
//         multiplier: 0.75,
//         outputStride: 16,
//         quantBytes: 2,
//       });

//       const video = videoRef.current;

//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;
//         video.play();
        
//         video.onloadeddata = () => {
//           segmentPerson(net);
//         };
//       } catch (err) {
//         console.error("Ошибка доступа к камере", err);
//       }
//     };

//     const segmentPerson = async (net) => {
//       const canvas = canvasRef.current;
//       const video = videoRef.current;
//       const ctx = canvas.getContext("2d");

//       const processFrame = async () => {
//         const segmentation = await net.segmentPerson(video, {
//           flipHorizontal: false,
//           internalResolution: "medium", // Используем полное разрешение для более точной обработки
//           // internalResolution: "full", // Используем полное разрешение для более точной обработки
//           segmentationThreshold: 0.7, // Более низкий порог для более широкого захвата частей тела
//         });

//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // Добавляем изображение на фон
//         const backgroundImage = backgroundImageRef.current;
//         ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

//         // Рисуем видео поверх изображения
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//         const { data: mask } = segmentation;

//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const pixel = imageData.data;

//         for (let i = 0; i < pixel.length; i += 4) {
//           const shouldHide = mask[i / 4] === 0; // Если маска равна 0, это не человек

//           if (shouldHide) {
//             pixel[i + 3] = 0; // Устанавливаем альфа-канал на 0 (прозрачность)
//           }
//         }

//         ctx.putImageData(imageData, 0, 0);
//         requestAnimationFrame(processFrame);
//       };

//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       processFrame();
//     };

//     loadBodyPix();
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} style={{ display: "none" }} />
//       <canvas ref={canvasRef} />

//       {/* Изображение для фона */}
//       <img
//         ref={backgroundImageRef}
//         src="src/assets/firstMainBg.jpeg" // Замени на нужный фон
//         alt="Background"
//         style={{ display: "none" }}
//       />
//     </div>
//   );
// };

// export default HumanSegmentation;




// import React, { useRef, useEffect } from "react";
// import backgroundUrl from "./images.png";
// const SimpleChromakey = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const backgroundImageRef = useRef(null);

//   useEffect(() => {
//     const startChromakey = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         const video = videoRef.current;

//         video.srcObject = stream;
//         video.play();

//         video.onloadeddata = () => {
//           processVideoFrames();
//         };
//       } catch (err) {
//         console.error("Ошибка доступа к камере", err);
//       }
//     };

//     const processVideoFrames = () => {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
//       const background = backgroundImageRef.current;

//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const processFrame = () => {
//         // ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаем canvas
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Рисуем видео поверх
//         ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Рисуем фон

//         const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const data = frame.data;

//         // Убираем зеленый фон
//         for (let i = 0; i < data.length; i += 4) {
//           const r = data[i]; // Красный
//           const g = data[i + 1]; // Зеленый
//           const b = data[i + 2]; // Синий

//           // Если пиксель близок к зеленому цвету, делаем его прозрачным
//           if (g > 100 && r < 100 && b < 100) {
//             data[i + 3] = 0; // Альфа-канал в 0
//           }
//         }

//         ctx.putImageData(frame, 0, 0); // Обновляем canvas
//         requestAnimationFrame(processFrame); // Обрабатываем следующий кадр
//       };

//       processFrame();
//     };

//     startChromakey();
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} style={{ display: "none" }} />
//       <canvas ref={canvasRef} />
//       <img
//         ref={backgroundImageRef}
//         src={backgroundUrl} // URL изображения фона
//         alt="Background"
//         style={{ display: "none" }}
//       />
//     </div>
//   );
// };

// export default SimpleChromakey;




// import React, { useRef, useEffect } from "react";

// function ChromakeyWithReplacement({ photoUrl, backgroundUrl }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const applyChromakey = (image, background) => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       // Устанавливаем размеры canvas под изображение
//       canvas.width = image.width;
//       canvas.height = image.height;

//       // Рисуем фон на canvas
//       ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

//       // Рисуем исходное изображение поверх фона
//       ctx.drawImage(image, 0, 0);

//       // Получаем данные пикселей
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const data = imageData.data;

//       // Настройки хромакея
//       const targetColor = { r: 0, g: 255, b: 0 }; // Зеленый фон
//       const threshold = 50; // Допустимый порог

//       // Перебираем пиксели
//       for (let i = 0; i < data.length; i += 4) {
//         const r = data[i]; // Красный
//         const g = data[i + 1]; // Зеленый
//         const b = data[i + 2]; // Синий

//         // Проверяем, насколько цвет близок к целевому
//         if (
//           Math.abs(r - targetColor.r) < threshold &&
//           Math.abs(g - targetColor.g) < threshold &&
//           Math.abs(b - targetColor.b) < threshold
//         ) {
//           // Устанавливаем прозрачность пикселя
//           data[i + 3] = 0; // Альфа-канал
//         }
//       }

//       // Обновляем изображение на canvas
//       ctx.putImageData(imageData, 0, 0);
//     };

//     const image = new Image();
//     const background = new Image();

//     image.src = photoUrl;
//     background.src = backgroundUrl;

//     // Обрабатываем изображение, когда оба изображения загрузятся
//     image.onload = () => {
//       background.onload = () => {
//         applyChromakey(image, background);
//       };
//     };
//   }, [photoUrl, backgroundUrl]);

//   return <canvas ref={canvasRef} style={{ width: 530, height: 530, position: 'relative' }} className='border-solid border-2 capture-container rounded-md object-cover' />;
// }

// export default ChromakeyWithReplacement;







// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// function ReplaceBackground({ photoUrl, backgroundUrl }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const processImage = async () => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       // Загружаем изображение
//       const image = new Image();
//       image.src = photoUrl;

//       // Ждём, пока изображение загрузится
//       image.onload = async () => {
//         canvas.width = image.width;
//         canvas.height = image.height;

//         // Загружаем модель BodyPix
//         const net = await bodyPix.load();

//         // Выполняем сегментацию (поиск объекта на изображении)
//         const segmentation = await net.segmentPerson(image, {
//           internalResolution: "medium",
//           segmentationThreshold: 0.7, // Порог точности (0-1)
//         });

//         // Рисуем новый фон, если он задан
//         if (backgroundUrl) {
//           const background = new Image();
//           background.src = backgroundUrl;

//           background.onload = () => {
//             ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
//             drawForeground(image, segmentation, ctx);
//           };
//         } else {
//           // Если фон не задан, делаем прозрачный фон
//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           drawForeground(image, segmentation, ctx);
//         }
//       };
//     };

//     const drawForeground = (image, segmentation, ctx) => {
//       // Создаём маску объекта
//       const mask = bodyPix.toMask(segmentation);

//       // Рисуем объект поверх нового фона
//       ctx.globalCompositeOperation = "source-over"; // Нормальный режим рисования
//       ctx.drawImage(image, 0, 0);

//       // Применяем маску для удаления фона
//       ctx.globalCompositeOperation = "destination-in"; // Убираем фон
//       const maskCanvas = document.createElement("canvas");
//       maskCanvas.width = mask.width;
//       maskCanvas.height = mask.height;
//       const maskCtx = maskCanvas.getContext("2d");
//       const maskImageData = maskCtx.createImageData(mask.width, mask.height);
//       maskImageData.data.set(mask.data);
//       maskCtx.putImageData(maskImageData, 0, 0);
//       ctx.drawImage(maskCanvas, 0, 0);
//     };

//     processImage();
//   }, [photoUrl, backgroundUrl]);

//   return <canvas ref={canvasRef} style={{ width: 530, height: 530, position: 'relative' }} className='border-solid border-2 capture-container rounded-md object-cover'/>;
// }

// export default ReplaceBackground;


// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// function ReplaceBackground({ photoUrl, backgroundUrl }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const processImage = async () => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       // Загружаем изображение
//       const image = new Image();
//       image.src = photoUrl;

//       image.onload = async () => {
//         canvas.width = image.width;
//         canvas.height = image.height;

//         // Загружаем модель BodyPix
//         const net = await bodyPix.load();

//         // Выполняем сегментацию (поиск человека на изображении)
//         const segmentation = await net.segmentPerson(image, {
//           internalResolution: "medium",
//           segmentationThreshold: 0.7, // Порог точности
//         });

//         // Рисуем новый фон, если он задан
//         if (backgroundUrl) {
//           const background = new Image();
//           background.src = backgroundUrl;

//           background.onload = () => {
//             // Сначала рисуем новый фон
//             ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

//             // Затем рисуем человека поверх фона
//             drawPerson(image, segmentation, ctx);
//           };
//         } else {
//           // Если фон не задан, делаем прозрачный фон
//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           drawPerson(image, segmentation, ctx);
//         }
//       };
//     };

//     const drawPerson = (image, segmentation, ctx) => {
//       // Создаём маску для объекта (человека)
//       const mask = bodyPix.toMask(segmentation);

//       // Рисуем объект (человека) поверх нового фона
//       const maskCanvas = document.createElement("canvas");
//       maskCanvas.width = mask.width;
//       maskCanvas.height = mask.height;
//       const maskCtx = maskCanvas.getContext("2d");

//       // Создаём маску изображения
//       const maskImageData = maskCtx.createImageData(mask.width, mask.height);
//       maskImageData.data.set(mask.data);
//       maskCtx.putImageData(maskImageData, 0, 0);

//       // Применяем маску: выделяем только человека
//       ctx.globalCompositeOperation = "destination-in";
//       ctx.drawImage(maskCanvas, 0, 0);

//       // Возвращаем режим рисования к обычному
//       ctx.globalCompositeOperation = "source-over";
//       ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
//     };

//     processImage();
//   }, [photoUrl, backgroundUrl]);

//   return <canvas ref={canvasRef} style={{ width: 530, height: 530, position: 'relative' }} className='border-solid border-2 capture-container rounded-md object-cover'/>;
// }

// export default ReplaceBackground;


// import React, { useRef, useState } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// const PhotoBackgroundRemover = () => {
//   const canvasRef = useRef(null);
//   const [image, setImage] = useState(null);

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImage(e.target.result); // Загружаем изображение
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeBackground = async () => {
//     if (!image) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const img = new Image();

//     img.onload = async () => {
//       canvas.width = img.width;
//       canvas.height = img.height;

//       ctx.drawImage(img, 0, 0, img.width, img.height);

//       const net = await bodyPix.load(); // Загружаем модель
//       const segmentation = await net.segmentPerson(canvas, {
//         flipHorizontal: false,
//         internalResolution: "medium",
//         segmentationThreshold: 0.7, // Порог для сегментации
//       });

//       const { data: mask } = segmentation;
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const pixel = imageData.data;

//       // Удаляем фон, устанавливая прозрачность для пикселей, не принадлежащих человеку
//       for (let i = 0; i < pixel.length; i += 4) {
//         const shouldHide = mask[i / 4] === 0; // Если маска равна 0, это фон
//         if (shouldHide) {
//           pixel[i + 3] = 0; // Устанавливаем альфа-канал в 0
//         }
//       }

//       ctx.putImageData(imageData, 0, 0);
//     };

//     img.src = image;
//   };

//   return (
//     <div>
//       <input type="file" accept="image/*" onChange={handleImageUpload} />
//       {image && (
//         <button onClick={removeBackground}>Убрать фон</button>
//       )}
//       <canvas ref={canvasRef} style={{ display: image ? "block" : "none" }} />
//     </div>
//   );
// };

// export default PhotoBackgroundRemover;























































// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";
// import image_back from "./assets/defaultImage.jpeg"
// import { useStore } from "./admin/store";
// import { drawCromakeyBackgroundImage } from "./components/CanvasDrawer";
// import back_img from './assets/defaultImage.jpeg';
// const PhotoBackgroundRemover = ({ image, setCaptured }) => {
//   const { chromokeyBackgroundImage } = useStore();
//   const canvasRef = useRef(null);

  // useEffect(() => {
  //   const processImage = async () => {
  //     if (!image) {
  //       console.error("Изображение не передано");
  //       return;
  //     }
  
  //     const canvas = canvasRef.current;
  //     const ctx = canvas.getContext("2d", { willReadFrequently: true });
  //     // Создание временного холста для обработки изображения
  //     const tempCanvas = document.createElement("canvas");
  //     const tempCtx = tempCanvas.getContext("2d");
  //     // Инициализация переменных
  //     const img = new Image();
  //     const backgroundImg = new Image();
  
  //     // Устанавливаем пути к изображениям
  //     backgroundImg.src = chromokeyBackgroundImage.src;
  //     img.src = image;
  
  //     backgroundImg.onload = () => {
  //       console.log("Фон загружен:", backgroundImg.src);
  //     };
  
  //     img.onload = async () => {
  //       try {
  //         console.log("Основное изображение загружено:", img.src);
  
  //         // Настраиваем размеры холста
  //         const targetWidth = 530;
  //         const targetHeight = 530;
  
  //         canvas.width = targetWidth;
  //         canvas.height = targetHeight;
  
  //         // Масштаб и центрирование изображения
  //         const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
  //         const offsetX = (targetWidth - img.width * scale) / 2;
  //         const offsetY = (targetHeight - img.height * scale) / 2;
  
  //         // Загрузка модели BodyPix
  //         const net = await bodyPix.load();
  
  //         // Сегментация объекта
  //         const segmentation = await net.segmentPerson(img, {
  //           flipHorizontal: false,
  //           internalResolution: "medium",
  //           segmentationThreshold: 0.4,
  //         });
  
  //         if (!segmentation || !segmentation.data) {
  //           console.error("Сегментация не удалась");
  //           return;
  //         }
  
  //         const { data: mask } = segmentation;
  
  
  //         tempCanvas.width = img.width;
  //         tempCanvas.height = img.height;
  
  //         // Рисуем основное изображение
  //         tempCtx.drawImage(img, 0, 0, img.width, img.height);
  
  //         // Применяем маску
  //         const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  //         const pixel = imageData.data;

  //         for (let i = 0; i < pixel.length; i += 4) {
  //           if (mask[i / 4] === 0) {
  //             pixel[i + 3] = 0;
  //           }
  //         }
  
  //         tempCtx.putImageData(imageData, 0, 0);
  
  //         // Очистка основного холста
  //         ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  //         // Рисуем фон
  //         ctx.drawImage(
  //           backgroundImg,
  //           0,
  //           0,
  //           backgroundImg.width,
  //           backgroundImg.height,
  //           0,
  //           0,
  //           canvas.width,
  //           canvas.height
  //         );
  
  //         // Накладываем вырезанное изображение
  //         ctx.drawImage(
  //           tempCanvas,
  //           0,
  //           0,
  //           tempCanvas.width,
  //           tempCanvas.height,
  //           offsetX,
  //           offsetY,
  //           tempCanvas.width * scale,
  //           tempCanvas.height * scale
  //         );
  
  //         // Сохраняем результат
  //         setCaptured(canvas.toDataURL("image/png"));
  //       } catch (err) {
  //         console.error("Ошибка обработки изображения:", err);
  //       }
  //     };
  
  //     img.onerror = () => {
  //       console.error("Не удалось загрузить изображение:", img.src);
  //     };
  
  //     backgroundImg.onerror = () => {
  //       console.error("Не удалось загрузить фон:", backgroundImg.src);
  //     };
  //   };
  
  //   processImage();
  // }, []);

//   useEffect(() => {
//     const processChromaKey = () => {
//       if (!image) {
//         console.error("Изображение не передано");
//         return;
//       }
  
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
//       const img = new Image();
//       const backgroundImg = new Image();
  
//       // Укажите путь к изображениям
//       img.src = image;
//       backgroundImg.src = chromokeyBackgroundImage.src;
  
//       img.onload = () => {
//         console.log("Основное изображение загружено:", img.src);
  
//         // Настраиваем размеры холста
//         canvas.width = img.width;
//         canvas.height = img.height;
  
//         // Рисуем фон
//         backgroundImg.onload = () => {
//           ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  
//           // Рисуем основное изображение
//           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
//           // Удаляем зеленый фон
//           const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//           const pixel = imageData.data;
  
//           for (let i = 0; i < pixel.length; i += 4) {
//             const r = pixel[i]; // Красный канал
//             const g = pixel[i + 1]; // Зеленый канал
//             const b = pixel[i + 2]; // Синий канал
  
//             // Проверяем, является ли пиксель зеленым
//             if (isGreenPixel(r, g, b)) {
//               pixel[i + 3] = 0; // Устанавливаем прозрачность
//             }
//           }
  
//           ctx.putImageData(imageData, 0, 0);
  
//           // Сохраняем результат
//           setCaptured(canvas.toDataURL("image/png"));
//         };
//       };
  
//       img.onerror = () => {
//         console.error("Не удалось загрузить изображение:", img.src);
//       };
  
//       backgroundImg.onerror = () => {
//         console.error("Не удалось загрузить фон:", backgroundImg.src);
//       };
//     };
  
//     processChromaKey();
//   }, [image, chromokeyBackgroundImage]);
//   const isGreenPixel = (r, g, b) => {
//     // Перевод RGB в HSV
//     const rNorm = r / 255;
//     const gNorm = g / 255;
//     const bNorm = b / 255;
  
//     const max = Math.max(rNorm, gNorm, bNorm);
//     const min = Math.min(rNorm, gNorm, bNorm);
//     const delta = max - min;
  
//     let hue = 0;
//     if (delta !== 0) {
//       if (max === rNorm) {
//         hue = ((gNorm - bNorm) / delta) % 6;
//       } else if (max === gNorm) {
//         hue = (bNorm - rNorm) / delta + 2;
//       } else {
//         hue = (rNorm - gNorm) / delta + 4;
//       }
//       hue *= 60;
//       if (hue < 0) hue += 360;
//     }
  
//     const saturation = max === 0 ? 0 : delta / max;
//     const value = max;
  
//     // Проверка на зелёный оттенок
//     return hue >= 60 && hue <= 180 && saturation > 0.4 && value > 0.2;
//   };
  
  
//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         width: "530px",
//         height: "530px",
//         display: "block",
//         // backgroundImage: `url(${image_back})`,
//         // backgroundSize: "cover",
//         // backgroundPosition: "center",
//         // backgroundRepeat: "no-repeat",
//         // position: "relative",
//         // zIndex: -1,
//         // cursor: "pointer",
//       }}
//       className="border-solid border-2 capture-container rounded-md object-cover"
//     />
//   );
// };

// export default PhotoBackgroundRemover;
































// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// const PhotoBackgroundReplacer = ({ image, backgroundImage }) => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const processImage = async () => {
//       if (!image || !backgroundImage) return;

//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       const img = new Image();
//       const bgImg = new Image();

//       // Обработка после загрузки обоих изображений
//       const drawImages = async () => {
//         const targetWidth = 530;
//         const targetHeight = 530;

//         canvas.width = targetWidth;
//         canvas.height = targetHeight;

//         // Масштабируем фон
//         const bgScale = Math.min(targetWidth / bgImg.width, targetHeight / bgImg.height);
//         const bgOffsetX = (targetWidth - bgImg.width * bgScale) / 2;
//         const bgOffsetY = (targetHeight - bgImg.height * bgScale) / 2;

//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(
//           bgImg,
//           0,
//           0,
//           bgImg.width,
//           bgImg.height,
//           bgOffsetX,
//           bgOffsetY,
//           bgImg.width * bgScale,
//           bgImg.height * bgScale
//         );

//         // Масштабируем основное изображение
//         const imgScale = Math.min(targetWidth / img.width, targetHeight / img.height);
//         const imgOffsetX = (targetWidth - img.width * imgScale) / 2;
//         const imgOffsetY = (targetHeight - img.height * imgScale) / 2;

//         ctx.drawImage(
//           img,
//           0,
//           0,
//           img.width,
//           img.height,
//           imgOffsetX,
//           imgOffsetY,
//           img.width * imgScale,
//           img.height * imgScale
//         );

//         // Загружаем модель BodyPix
//         const net = await bodyPix.load();
//         const segmentation = await net.segmentPerson(canvas, {
//           flipHorizontal: false,
//           internalResolution: "medium",
//           segmentationThreshold: 0.7,
//         });

//         const { data: mask } = segmentation;
//         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//         const pixel = imageData.data;

//         // Удаляем фон из основного изображения
//         for (let i = 0; i < pixel.length; i += 4) {
//           const shouldHide = mask[i / 4] === 0;
//           if (shouldHide) {
//             pixel[i + 3] = 0;
//           }
//         }

//         ctx.putImageData(imageData, imgOffsetX, imgOffsetY);
//       };

//       // Загружаем изображения
//       img.onload = () => bgImg.onload && drawImages();
//       bgImg.onload = () => img.onload && drawImages();

//       img.src = image;
//       bgImg.src = backgroundImage;
//     };

//     processImage();
//   }, [image, backgroundImage]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         width: "530px",
//         height: "530px",
//         position: "relative",
//       }}
//       className="border-solid border-2 capture-container rounded-md object-cover"
//     />
//   );
// };

// export default PhotoBackgroundReplacer;
































// import React, { useRef, useEffect } from "react";
// import * as bodyPix from "@tensorflow-models/body-pix";
// import "@tensorflow/tfjs";

// const PhotoBackgroundReplacer = ({ image, backgroundImage }) => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const processImage = async () => {
//       if (!image || !backgroundImage) return;

//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       const personImg = new Image();
//       const bgImg = new Image();
//       bgImg.src = backgroundImage;
//       personImg.onload = async () => {
//         // Устанавливаем размеры канваса в соответствии с изображением
//         canvas.width = personImg.width;
//         canvas.height = personImg.height;

//         // Загружаем модель BodyPix для сегментации человека
//         const net = await bodyPix.load();
//         const segmentation = await net.segmentPerson(personImg, {
//           flipHorizontal: false,
//           internalResolution: "medium",
//           segmentationThreshold: 0.7,
//         });

//         // Создаем маску для человека
//         const mask = bodyPix.toMask(segmentation);

//         // Рисуем фон
//         ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
//         ctx.fill()
//         // Применяем маску и накладываем обработанное изображение человека
//         ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
//         ctx.globalCompositeOperation = "source-in";
//         ctx.drawImage(personImg, 0, 0, canvas.width, canvas.height);

//         // Возвращаем режим смешивания в нормальный
//         ctx.globalCompositeOperation = "source-over";
//       };

//       // Загружаем фоновое изображение
//       bgImg.onload = () => {
//         personImg.src = image; // Начинаем обработку только после загрузки фона
//       };

//     };

//     processImage();
//   }, [image, backgroundImage]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         width: "100%",
//         maxWidth: "530px",
//         height: "auto",
//       }}
//       className="border-solid border-2 rounded-md"
//     />
//   );
// };

// export default PhotoBackgroundReplacer;
