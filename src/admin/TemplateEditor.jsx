import { useState, useRef, useEffect } from 'react';
import AdminShell from '../components/AdminShell';
import { useStore } from './store';
import { Plus, Save, Square, Circle, Triangle, Minus, Trash2, Star, Octagon, FileImage, SaveIcon, ArrowBigUpDash } from "lucide-react";
import ObjectProperties from '../components/ObjectProperties';
import { useFetcher } from 'react-router-dom';
import { usePageNavigation } from '../App';
import { toast, ToastContainer } from 'react-toastify';
import { invoke } from '@tauri-apps/api';
import { drawMyCanvas, drawCanvasForSelect } from '../components/CanvasDrawer';

const props = {
    page: 'Редактор Шаблонов',
    type: 'template',
};

export default function TemplateEditor() {

    usePageNavigation();

    const { addObject, setCanvasProps, canvases, currentCanvasId, updateObjectProps, removeObject, addCanvas, removeCanvas, switchCanvas, setCanvasData, updated, setUpdated } = useStore();
    const [activeTab, setActiveTab] = useState('shapes');
    const canvasRef = useRef(null);
    const canvasRefForSelect = useRef(null);
    const currentCanvas = canvases.find(canvas => canvas.id === currentCanvasId);
    const fileInputRef = useRef(null);
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    if (updated === true) setUpdated(false);

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
            type: shapeType,
            left: 100,
            top: 100,
            width: 300,
            height: 300,
            fill: '#ff0000',
            zIndex: 2,
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
            type: 'image',
            // fill: 'rgba(0, 0, 0, 0)', // Прозрачный фон для изображения
            src: imageSrc,
            imgObject: imgObject,
            left: 50,
            top: 50,
            width: imgWidth,
            height: imgHeight,
            zIndex: 2,
            rotate: 0,
            opacity: 1
        };
        addObject(currentCanvasId, newImage);
    };

    const addPhotoPlaceholder = () => {
        const photoPlaceholder = {
            id: Date.now(),
            type: 'image',
            left: 48,
            top: 48,
            width: 530,
            height: 490,
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

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const canvasSel = canvasRefForSelect.current;
        const ctxSel = canvasSel.getContext('2d');
        
        // console.log(currentCanvas.canvasProps)
        if (currentCanvas) {
            drawMyCanvas(ctx, canvas, currentCanvas);
            drawCanvasForSelect(ctxSel, canvasSel, currentCanvas);
        }
    }, [currentCanvas]);

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
    }, [isDragging, draggedObjectId, dragOffset, currentCanvas.objects]);

    async function loadAllCanvasData() {
        try {
            const canvasArray = await invoke('load_all_canvas_data');
            console.log(canvasArray[0].objects);
            switchCanvas(1); // Switch to the first canvas
            setCanvasData(canvasArray); // Use the new function to update the canvases
            toast.success('Данные обновлены');
        } catch (error) {
            toast.error('Failed to load all canvas data:', error);
            // Handle error if necessary
        }
    }

    async function saveCanvasData(canvasId, canvasData) {
        try {
            await invoke('save_canvas_data', {
                canvasId: String(canvasId), // ID холста
                data: JSON.stringify(canvasData), // Данные холста в формате JSON
                available: canvasData.canvasProps.available,
            });
            console.log('Canvas data saved successfully.');
        } catch (error) {
            console.error('Failed to save canvas data:', error);
        }
    }

    async function saveCanvasImage(canvasId, canvasData) {
        try {
            const imageDataUrl = canvasRef.current.toDataURL('image/png');

            // Убираем префикс data:image/png;base64, чтобы передать только base64
            const imageBase64 = imageDataUrl.replace(/^data:image\/(png|jpg);base64,/, '');

            // Отправляем на бэк
            await invoke('save_canvas_image', {
                canvasId: String(canvasId),
                base64Image: imageBase64,
                available: canvasData.canvasProps.available,
            });

            console.log('Canvas image saved successfully.');
            } catch (error) {
            console.error('Failed to save canvas image:', error);
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
            saveCanvasImage(currentCanvas.id, currentCanvas);
            toast.success('Данные сохранены');
        } catch (error) {
            toast.error('Не удалось сохранить данные:', error);
        }
    }

    return (
        <AdminShell props={props}>
            <div className="flex flex-col">
                <div className='flex gap-8 w-full'>
                    <div className="w-3/5">
                        <div className="flex justify-between items-center mb-4">
                            {/* Canvas or shapes will be rendered here */}
                            <canvas ref={canvasRef} style={{ border: '1px solid black', width: '413.3px', height: '614.6px' }}
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
                                    Фигуры
                                </button>
                                <button
                                    className={`p-1 ${activeTab === 'properties' ? 'bg-white dark:bg-gray-500 rounded-md border' : ''}`}
                                    onClick={() => setActiveTab('properties')}
                                >
                                    Свойства
                                </button>
                                <button
                                    className={`p-1 ${activeTab === 'canvas' ? 'bg-white dark:bg-gray-500 rounded-md border' : ''}`}
                                    onClick={() => setActiveTab('canvas')}
                                >
                                    Холст
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
                                </div>
                            )}
                            {activeTab === 'properties' && (
                                <div className='flex flex-col gap-4'>
                                    <div className='px-2 gap-x-2 gap-y-4'>
                                        <p>Объекты</p>
                                        <div className='flex flex-col overflow-auto h-24 gap-1 border rounded-md bg-gray-150 p-1'>
                                            {currentCanvas.objects.map((obj) => (
                                                <button key={obj.id} onClick={() => setSelectedObjectId(obj.id)} className={selectedObjectId === obj.id ? 'bg-blue-500 text-white rounded-md ' : 'flex justify-start'}>{obj.type === 'image' && obj.src === '' ? 'Фото: ' : 'Объект:'} {obj.id}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <ObjectProperties setSelectedObjectId={setSelectedObjectId} selectedObjectId={selectedObjectId} currentCanvas={currentCanvas} updateObject={updateObject}/>
                                    <button onClick={() => removeShape()}><Trash2 /></button>
                                </div>
                            )}
                            {activeTab === 'canvas' && (
                                <div className='flex flex-col gap-4'>
                                    <div className='px-2 gap-x-2 gap-y-4'>
                                        <p>Холсты</p>
                                        <div className='flex flex-col overflow-auto h-48 gap-1 border rounded-md bg-gray-150 p-1'>
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
                                                    type='number'
                                                    onChange={(e) => setCanvasProps(currentCanvas.id, { width: e.target.value })}
                                                    value={currentCanvas.canvasProps.width}
                                                    className='h-8 px-1 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                                            </div>
                                            <div className='flex gap-2 items-center justify-center'>
                                                <label className='w-4 flex items-center justify-center'>H</label>
                                                <input
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