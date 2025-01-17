import { useState, useRef, useEffect } from 'react';
import AdminShell from '../components/AdminShell';
import { useStore } from './store';
import { Plus, Save, Square, Circle, Triangle, Minus, Trash2, Star, Octagon, FileImage, SaveIcon, ArrowBigUpDash, X } from "lucide-react";
import ObjectProperties from '../components/ObjectProperties';
import { useFetcher } from 'react-router-dom';
import { usePageNavigation } from '../hooks/usePageNavigation.js';
import { toast, ToastContainer } from 'react-toastify';
import { invoke } from '@tauri-apps/api';
import { drawMyCanvas } from '../components/CanvasDrawer';
import { saveCanvasData, saveCanvasImage } from '../utils/canvasUtils';

const props = {
    page: 'Редактор Шаблонов',
    type: 'template',
};

export default function TemplateEditor() {

    usePageNavigation();

    const { addObject, setCanvasProps, canvases, currentCanvasId, updateObjectProps, removeObject, addCanvas, removeCanvas, switchCanvas, setCanvasData, updateStatus, setUpdateStatus, chromokeyBackgroundImage, backgroundImage, setBackgroundImage, chromokeyStatus } = useStore();
    const [activeTab, setActiveTab] = useState('shapes');
    const canvasRef = useRef(null);
    const canvasRefForSelect = useRef(null);
    const currentCanvas = canvases.find(canvas => canvas.id === currentCanvasId);
    const fileInputRef = useRef(null);
    const fileInputRefForSelect = useRef(null);
    const [selectedObjectId, setSelectedObjectId] = useState(null);

    const handleObjectClick = (e) => {
        // Получаем координаты клика относительно холста
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        // Ищем все объекты, которые находятся под кликом
        const clickedObjects = currentCanvas.objects.filter(obj => {
            return (
                x >= obj.left &&
                x <= obj.left + obj.width &&
                y >= obj.top &&
                y <= obj.top + obj.height
            );
        });
        if (clickedObjects.length > 0) {
            const topObject = clickedObjects.reduce((highest, obj) => {
                return (highest.zIndex > obj.zIndex) ? highest : obj;            
            }); 
            setSelectedObjectId(topObject.id);
        } else {
            setSelectedObjectId(null);
        }
    };

    const updateObject = (id, newProps) => {
        updateObjectProps(currentCanvasId, id, newProps);  // Триггерим обновление с новыми объектами
    };

    const fullPage = () => {
        updateObject(selectedObjectId, {
            left: 0,
            top: 0,
            width: 1240,
            height: 1844
        })
    };

    const removeShape = () => {
        if (selectedObjectId) {
            removeObject(currentCanvasId, selectedObjectId);
            setSelectedObjectId(null);
            toast.success('Объект удален');
        } else {
            toast.error('Выберите объект для удаления');
        }
    }

    // Добавление новой фигуры
    const addShape = (shapeType) => {
        const newShape = {
            id: Date.now(),
            nameObject: 'Фигура ' + shapeType,
            type: shapeType,
            left: 460,
            top: 700,
            width: 300,
            height: 300,
            fill: '#ff0000',
            zIndex: 4,
            stroke: '#000000',
            strokeWidth: 0,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        };
        if (shapeType === 'star') newShape.spikes = 5;
        if (shapeType === 'polygon') newShape.sides = 9;
        if (shapeType === 'line') {
            newShape.strokeWidth = 10;
            newShape.height = 10;
        }
        addObject(currentCanvasId, newShape);
    };

    const addNewImage = (imageSrc, imgWidth, imgHeight, imgObject) => {
        // const existingImage = currentCanvas.objects.find(obj => obj.src === imageSrc);
        // if (existingImage) return; // Пропускаем, если изображение уже существует
        const newImage = {
            id: Date.now(),
            nameObject: 'Изображение ' + Date.now(),
            type: 'image',
            // fill: 'rgba(0, 0, 0, 0)', // Прозрачный фон для изображения
            src: imageSrc,
            imgObject: imgObject,
            left: 50,
            top: 50,
            width: imgWidth,
            height: imgHeight,
            zIndex: 4,
            rotate: 0,
            opacity: 1
        };
        addObject(currentCanvasId, newImage);
    };

    const addPhotoPlaceholder = () => {
        const photoPlaceholder = {
            id: Date.now(),
            nameObject: 'Фото ' + Date.now(),
            type: 'image',
            left: 48,
            top: 48,
            width: 530,
            height: 490,
            numberImage: 1,
            // fill: 'rgba(0, 0, 0, 0)', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        };
        addObject(currentCanvasId, photoPlaceholder);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];  // Получаем первый файл из input
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    addNewImage(event.target.result, img.width, img.height, img);  // Передаем base64 и реальные размеры изображения
                };
            };
            reader.readAsDataURL(file);  // Преобразуем файл в base64
        }
    };

    const handleFullScreenImageUpload = (e) => {
        const file = e.target.files[0];  // Получаем первый файл из input
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                        // addNewImage(event.target.result, img.width, img.height, img);  // Передаем base64 и реальные размеры изображения
                        // imageSrc, imgWidth, imgHeight, imgObject
                    const newImage = {
                        id: Date.now(),
                        nameObject: 'Изображение ' + Date.now(),
                        type: 'image',
                        // fill: 'rgba(0, 0, 0, 0)', // Прозрачный фон для изображения
                        src: event.target.result,
                        imgObject: img,
                        left: 0,
                        top: 0,
                        width: 1240,
                        height: 1844,
                        zIndex: 2,
                        rotate: 0,
                        opacity: 1
                    };
                    addObject(currentCanvasId, newImage);
                };
            };
            reader.readAsDataURL(file);  // Преобразуем файл в base64
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const canvasSel = canvasRefForSelect.current;
        const ctxSel = canvasSel.getContext('2d');
        function drawDashedCenterLines(ctx, canvasWidth, canvasHeight, object) {
            // Центр объекта
            const objectCenterX = object.x + object.width / 2;
            const objectCenterY = object.y + object.height / 2;
        
            // Настройки для линий
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Полупрозрачный черный цвет
            ctx.lineWidth = 10; // Толщина линии
            ctx.setLineDash([50, 5]); // Пунктир: 5px линия, 5px пробел
        
            // Рисуем вертикальную линию через центр объекта
            ctx.beginPath();
            ctx.moveTo(objectCenterX, 0); // Начало линии сверху
            ctx.lineTo(objectCenterX, canvasHeight); // Линия вниз до края холста
            ctx.stroke();
        
            // Рисуем горизонтальную линию через центр объекта
            // ctx.beginPath();
            // ctx.moveTo(0, objectCenterY); // Начало линии слева
            // ctx.lineTo(canvasWidth, objectCenterY); // Линия вправо до края холста
            // ctx.stroke();
        
            // Сбрасываем пунктирный стиль для последующих линий
            ctx.setLineDash([]);
        }
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const object = { x: 0, y: 0, width: 1244, height: 1840 };


        

        // console.log(currentCanvas.canvasProps)
        const drawMarkers = (ctx, obj) => {
            if (!obj) return;

            const borderThickness = 8; // Толщина линии
            const lineLength = obj.width / 2;
            const topLineLength = obj.height / 2; // Длина линий на каждом углу

            ctx.strokeStyle = 'black'; // Цвет линии
            ctx.lineWidth = borderThickness;

            // Линии сверху
            ctx.beginPath();
            ctx.moveTo(obj.left - 4, obj.top); // Верхний левый
            ctx.lineTo(obj.left + lineLength, obj.top); // Верхний левый горизонтально
            ctx.moveTo(obj.left, obj.top); // Верхний левый
            ctx.lineTo(obj.left, obj.top + topLineLength); // Верхний левый вертикально

            ctx.moveTo(obj.left + obj.width + 4, obj.top); // Верхний правый
            ctx.lineTo(obj.left + obj.width - lineLength, obj.top); // Верхний правый горизонтально
            ctx.moveTo(obj.left + obj.width, obj.top); // Верхний правый
            ctx.lineTo(obj.left + obj.width, obj.top + topLineLength); // Верхний правый вертикально

            // Линии снизу
            ctx.moveTo(obj.left - 4, obj.top + obj.height); // Нижний левый
            ctx.lineTo(obj.left + lineLength, obj.top + obj.height); // Нижний левый горизонтально
            ctx.moveTo(obj.left, obj.top + obj.height); // Нижний левый
            ctx.lineTo(obj.left, obj.top + obj.height - topLineLength); // Нижний левый вертикально

            ctx.moveTo(obj.left + obj.width + 4, obj.top + obj.height); // Нижний правый
            ctx.lineTo(obj.left + obj.width - lineLength, obj.top + obj.height); // Нижний правый горизонтально
            ctx.moveTo(obj.left + obj.width, obj.top + obj.height); // Нижний правый
            ctx.lineTo(obj.left + obj.width, obj.top + obj.height - topLineLength); // Нижний правый вертикально

            ctx.stroke();
        };
    
        if (currentCanvas) {
            // Рисуем основной холст
            drawMyCanvas(ctx, canvas, currentCanvas, true, chromokeyStatus === true ? chromokeyBackgroundImage : backgroundImage, false);
            drawMyCanvas(ctxSel, canvasSel, currentCanvas, false, chromokeyStatus === true ? chromokeyBackgroundImage : backgroundImage, false);
            // Выделяем объект, если он выбран
            if (selectedObjectId) {
                const selectedObject = currentCanvas.objects.find(obj => obj.id === selectedObjectId);
                if (selectedObject) {
                    drawMarkers(ctx, selectedObject);
                }
            }
        }
    }, [currentCanvas, selectedObjectId]);

    const [isDragging, setIsDragging] = useState(false); // To check if we're dragging
    const [draggedObjectId, setDraggedObjectId] = useState(null); // To store which object is being dragged
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // To track the offset of the drag start

    useEffect(() => {
        const canvas = canvasRef.current;

        const handleMouseDown = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const clickedObjects = currentCanvas.objects.filter(obj => {
                return (
                    x >= obj.left &&
                    x <= obj.left + obj.width &&
                    y >= obj.top &&
                    y <= obj.top + obj.height
                );
            });
            if (clickedObjects.length > 0) {
                const topObject = clickedObjects.reduce((maxObj, obj) =>
                    obj.zIndex > maxObj.zIndex ? obj : maxObj
                );
                setIsDragging(true);
                setDraggedObjectId(topObject.id);
                setDragOffset({ x: x - topObject.left, y: y - topObject.top });
            } else {
                setSelectedObjectId(null);
            }
        };

        const handleMouseMove = (e) => {
            if (!isDragging || !draggedObjectId) return;
            setSelectedObjectId(draggedObjectId);
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            const newLeft = Math.round(x - dragOffset.x);
            const newTop = Math.round(y - dragOffset.y);
            // Update the object's position
            updateObject(draggedObjectId, { left: newLeft, top: newTop });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDraggedObjectId(null);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, draggedObjectId, dragOffset, currentCanvas?.objects]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedObjectId || !currentCanvas) return;
    
            const step = 1; // Шаг перемещения объекта
            const object = currentCanvas.objects.find(obj => obj.id === selectedObjectId);
            if (!object) return;
    
            switch (e.key) {
                case 'ArrowUp':
                    updateObject(selectedObjectId, { top: object.top - step });
                    break;
                case 'ArrowDown':
                    updateObject(selectedObjectId, { top: object.top + step });
                    break;
                case 'ArrowLeft':
                    updateObject(selectedObjectId, { left: object.left - step });
                    break;
                case 'ArrowRight':
                    updateObject(selectedObjectId, { left: object.left + step });
                    break;
                case 'Delete':
                    removeObject(selectedObjectId);
                    removeShape(selectedObjectId);
                    setSelectedObjectId(null);
                    break;
                case 'Escape':
                    removeObject(selectedObjectId);
                    setSelectedObjectId(null);
                default:
                    break;
            }
        };
    
        // Добавляем слушатель события
        window.addEventListener('keydown', handleKeyDown);
    
        // Удаляем слушатель при размонтировании
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedObjectId, currentCanvas, updateObject, removeObject]);

    async function loadAllCanvasData() {
        try {
            const canvasArray = await invoke('load_all_canvas_data');
            // console.log(canvasArray[0].objects);
            switchCanvas(1); // Switch to the first canvas
            setCanvasData(canvasArray); // Use the new function to update the canvases
            setUpdateStatus(true);
            toast.success('Данные обновлены');
        } catch (error) {
            toast.error('Failed to load all canvas data:', error);
            // Handle error if necessary
        }
    }

    async function handleRemoveCanvas() {
        try {
            if (canvases.length === 1 || currentCanvas.id === 1) {
                if (canvases.length === 1) toast.error('Нельзя удалить последний холст');
                else toast.error('Нельзя удалить первый холст');
                return;
            }
            await invoke('delete_canvas_image_and_data', {
                canvasId: String(currentCanvas.id),
                available: currentCanvas.canvasProps.available
            });
            removeCanvas(currentCanvas.id);
            if ( canvases.length === 1 ) switchCanvas(1);
            switchCanvas(currentCanvas.id - 1);
            setSelectedObjectId(null);
            toast.success('Холст удален');
        } catch (error) {
            console.log('Failed to delete canvas:', error);
            toast.error('Не удалось удалить холст:', error);
        }
    }

    const saveAllData = () => {
        try {
            currentCanvas.objects.map((obj) => {
                if (obj.type === 'image') obj.imgObject = '';
                // console.log('nice')
            });
            currentCanvas.canvasProps.webpData = canvasRefForSelect.current.toDataURL('image/webp');
            saveCanvasData(currentCanvas.id, currentCanvas);
            saveCanvasImage(currentCanvas.id, currentCanvas, canvasRef);
            toast.success('Данные сохранены');
        } catch (error) {
            toast.error('Не удалось сохранить данные:', error);
        }
    }

    const handlePrint = async ( currentCanvasId ) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const imageData = canvasRef.current.toDataURL('image/png');
            const imageBase64 = imageData.replace(/^data:image\/(png|jpg);base64,/, '');
            toast('Printing...', { type: 'info' });
            await invoke('print_image', { imageData: imageBase64 });
        } else {
            toast('No image available for printing', { type: 'warning' });
        }
    };

    const handleBackgroundChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageSrc = e.target.result;
            const imageObject = new Image();
            imageObject.src = imageSrc;
            // Обновляем состояние с новым изображением
            setBackgroundImage(imageSrc);
            // console.log(chromokeyBackgroundImage.scr);
            await invoke('save_background_image_for_photo', { image: imageSrc});

        };
        reader.readAsDataURL(file);

    };

    return (
        <AdminShell props={props}>
            <div className="flex flex-col">
                <div className='flex gap-8 w-full'>
                    <div className="w-3/5">
                        <div className="flex justify-between items-center mb-4">
                            {/* Canvas or shapes will be rendered here */}
                            <canvas ref={canvasRef} style={{ border: '1px solid black', width: currentCanvas.canvasProps.width / 3, height: currentCanvas.canvasProps.height / 3 }}
                                onClick={(e) => handleObjectClick(e)}
                            />
                            <canvas ref={canvasRefForSelect} style={{ width: '413.3px', height: '614.6px', display: 'none'}} />
                            {/* Render canvas from `canvases` */}
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="w-full flex gap-2 flex-col">
                            <div className="grid w-full grid-cols-3 bg-gray-50 dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600">
                                <button
                                    className={`p-1 ${activeTab === 'shapes' ? 'bg-white dark:bg-gray-500  rounded-md border' : ''}`}
                                    onClick={() => setActiveTab('shapes')}
                                >
                                    Фото рамки
                                </button>
                                <button
                                    className={`p-1 ${activeTab === 'properties' ? 'bg-white dark:bg-gray-500 rounded-md border' : ''}`}
                                    onClick={() => setActiveTab('properties')}
                                >
                                    Размер
                                </button>
                                <button
                                    className={`p-1 ${activeTab === 'canvas' ? 'bg-white dark:bg-gray-500 rounded-md border' : ''}`}
                                    onClick={() => setActiveTab('canvas')}
                                >
                                    Шаблоны
                                </button>
                            </div>

                            <div>
                            {activeTab === 'shapes' && (
                                <div className='flex flex-col'>
                                    <div className="flex justify-between p-2">
                                        <button onClick={() => addShape('rectangle')}><Square /></button>
                                        <button onClick={() => addShape('circle')}><Circle /></button>
                                        <button onClick={() => addShape('star')}><Star /></button>
                                        <button onClick={() => addShape('polygon')}><Octagon /></button>
                                        <button onClick={() => addShape('triangle')}><Triangle /></button>
                                        <button onClick={() => addShape('line')}><Minus /></button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}  // Скрываем input
                                        />
                                        <button onClick={() => fileInputRef.current.click()}><FileImage /></button>
                                        <button onClick={() => removeShape()}><Trash2 /></button>
                                    </div>
                                    <button onClick={() => addPhotoPlaceholder()} className="bg-blue-500 text-white p-3 rounded-lg mt-3 flex justify-center">
                                        <Plus /> Добавить фото-заглушку
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRefForSelect}
                                        accept="image/*"
                                        onChange={handleFullScreenImageUpload}
                                        style={{ display: 'none' }}  // Скрываем input
                                    />
                                    <button onClick={() => fileInputRefForSelect.current.click()} className="bg-blue-500 text-white p-3 rounded-lg mt-3 flex justify-center">
                                        <FileImage /> Добавить шаблон на весь экран
                                    </button>
                                    <div
                                        className="rounded-lg border flex justify-center items-center cursor-pointer col-span-2 w-fit h-fit mt-3"
                                        style={{ overflow: 'hidden', background: '#f3f3f3' }}
                                    >
                                        <label style={{ width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            {backgroundImage.src ? (
                                                <img
                                                    className="object-cover w-full h-full"
                                                    src={backgroundImage.src}
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
                            )}
                            {activeTab === 'properties' && (
                                <div className='flex flex-col gap-4'>
                                    <div className='px-2 gap-x-2 gap-y-4'>
                                        <p>Объекты</p>
                                        <div className='flex flex-col overflow-auto h-48 gap-1 border rounded-md bg-gray-150 p-1'>
                                            {currentCanvas.objects.map((obj) => (
                                                <button key={obj.id} onClick={() => setSelectedObjectId(obj.id)} className={selectedObjectId === obj.id ? 'bg-blue-500 text-white rounded-md ' : 'flex justify-start'}>{obj?.nameObject || 'Измените название'}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <ObjectProperties setSelectedObjectId={setSelectedObjectId} selectedObjectId={selectedObjectId} currentCanvas={currentCanvas} updateObject={updateObject}/>
                                    <div className='flex justify-between px-2'>
                                        <button onClick={() => removeShape()}><Trash2 /></button>
                                        <input type="text"
                                            value={currentCanvas?.objects.find(obj => obj.id === selectedObjectId)?.nameObject || ''}
                                            onChange={(e) => updateObject(selectedObjectId, { nameObject: e.target.value })}
                                            className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-40'
                                        />
                                    </div>
                                    {/* <div className='flex justify-center px-2'>
                                        <button onClick={() => fullPage()} className='border border-gray-300 rounded-md px-4 bg-blue-400'>
                                            <p>На весь экран</p>
                                        </button>
                                    </div> */}

                                </div>
                            )}
                            {activeTab === 'canvas' && (
                                <div className='flex flex-col gap-4'>
                                    <div className='px-2 gap-x-2 gap-y-4'>
                                        <p>Шаблоны</p>
                                        <div className='flex flex-col overflow-auto min-h-24 max-h-48 gap-1 border rounded-md bg-gray-150 p-1'>
                                            {canvases.map((canvas) => (
                                                <button key={canvas.id} onClick={() => switchCanvas(canvas.id)} className={currentCanvas.id === canvas.id ? 'bg-blue-500 text-white rounded-md ' : 'flex justify-start'}>{canvas.canvasProps.name}</button>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-300 my-2"></div>
                                        <div className='flex mt-1 justify-between'>
                                            <button className='flex bg-blue-500 text-white p-2 rounded-lg' onClick={() => addCanvas()}><Plus /> Добавить новый холст</button>
                                            <button className='bg-red-500 rounded-lg p-2 text-white' onClick={handleRemoveCanvas}><Trash2 /></button>
                                        </div>
                                        <div className='flex mt-1 justify-between'>
                                            <button className='flex bg-green-500 text-white p-2 rounded-lg' onClick={saveAllData}><SaveIcon />Сохранить холсты</button>
                                            <button className='flex bg-yellow-500 text-white p-2 rounded-lg' onClick={loadAllCanvasData}><ArrowBigUpDash /> Update</button>
                                        </div>
                                    </div>
                                    <div className='px-2 gap-x-2 gap-y-4'>
                                        <div className='grid grid-cols-3 px-2 gap-x-2 gap-y-4'>
                                            <p>Размер</p>
                                            <div className='flex gap-2 items-center justify-center'>
                                                <label className='w-4 flex items-center justify-center'>W</label>
                                                <input
                                                    min={200}
                                                    max={1240}
                                                    type='number'
                                                    onChange={(e) => setCanvasProps(currentCanvas.id, { width: e.target.value })}
                                                    value={currentCanvas.canvasProps.width}
                                                    className='h-8 px-1 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                                            </div>
                                            <div className='flex gap-2 items-center justify-center'>
                                                <label className='w-4 flex items-center justify-center'>H</label>
                                                <input
                                                    min={200}
                                                    max={1844}
                                                    type='number'
                                                    onChange={(e) => setCanvasProps(currentCanvas.id, { height: e.target.value })}
                                                    value={currentCanvas.canvasProps.height}
                                                    className='h-8 px-1 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                                            </div>
                                            <div className='flex gap-5 items-center  col-span-3'>
                                                <p>Цвет заливки</p>
                                                <input
                                                    className='h-8 border border-gray-300 dark:border-gray-600 rounded-md w-16'
                                                    type="color"
                                                    value={currentCanvas.canvasProps.backgroundColor}
                                                    onChange={(e) => setCanvasProps(currentCanvas.id, { backgroundColor: e.target.value })}
                                                />
                                            </div>
                                            <div className='flex gap-5 items-center  col-span-3'>
                                                <p>Название холста</p>
                                                <textarea
                                                    className='p-2 h-auto border border-gray-300 dark:border-gray-600 rounded-md w-48 text-wrap'
                                                    rows={1}
                                                    value={currentCanvas.canvasProps.name || 'Нету названия'}
                                                    onChange={(e) => setCanvasProps(currentCanvas.id, { name: e.target.value || 'Нету названия' })}
                                                />
                                            </div>
                                            <button
                                                className={`flex items-center justify-evenly col-span-3 ${currentCanvas.canvasProps.available ? 'bg-green-500' : 'bg-red-500'} text-white py-2 rounded-lg`}
                                                onClick={() => setCanvasProps(currentCanvas.id, { available: !currentCanvas.canvasProps.available })}>
                                                <input
                                                    type='checkbox'
                                                    checked={currentCanvas.canvasProps.available}
                                                    className='w-5 h-5'
                                                    onChange={() => setCanvasProps(currentCanvas.id, { available: !currentCanvas.canvasProps.available })}
                                                    />
                                                <p className='text-2xl'>Использовать Холст</p>
                                            </button>
                                            <div className='flex gap-2 items-center col-span-3 flex-wrap '>
                                                <button
                                                    className={`flex items-center justify-evenly w-fit bg-blue-600 text-white p-2 rounded-lg`}
                                                    onClick={() => handlePrint(currentCanvasId)}>
                                                    <p className='text-sm'>Пробная печать</p>
                                                </button>
                                                <button
                                                    className={`flex gap-2 items-center justify-evenly ${currentCanvas.canvasProps.dottedLine ? 'bg-green-500' : 'bg-red-500'} text-white p-2 rounded-lg`}
                                                    onClick={() => setCanvasProps(currentCanvas.id, { dottedLine: !currentCanvas.canvasProps.dottedLine })}>
                                                    <input
                                                        type='checkbox'
                                                        checked={currentCanvas.canvasProps.dottedLine}
                                                        className='w-4 h-4'
                                                        onChange={() => setCanvasProps(currentCanvas.id, { dottedLine: !currentCanvas.canvasProps.dottedLine })}
                                                        />
                                                    <p className='text-sm'>Пунктирной линии </p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer className="absolute" />
        </AdminShell>
    );
}
