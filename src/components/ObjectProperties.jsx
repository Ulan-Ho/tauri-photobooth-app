import { Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';

export default function ObjectProperties({ setSelectedObjectId, selectedObjectId, currentCanvas, updateObject }) {
    let selectedObject = currentCanvas.objects.find(obj => obj.id === selectedObjectId);

    // useEffect(() => {
    //     const object = currentCanvas.objects.find(obj => obj.id === selectedObjectId);
    //     setSelectedObjectId(object);
    // }, [selectedObjectId]);

    if (!selectedObject) return null;

    function clampRotation(angle) {
        // Приводим угол к диапазону -360 до 360
        if (angle < -360) {
            return angle + 360;
        }
        if (angle > 360) {
            return angle - 360;
        }
        return angle;
    }

    function updateRotation(selectedObjectId, rotationAmount) {
        const currentRotate = currentCanvas.objects.find(obj => obj.id === selectedObjectId)?.rotate || 0;
        const newRotate = clampRotation(currentRotate + rotationAmount); // Применяем ограничение
        if (newRotate !== 360 && newRotate !== -360) updateObject(selectedObjectId, { rotate: newRotate });
    }

    return (
        <div className='flex flex-col gap-2'>
            <div className='grid grid-cols-3 px-2 gap-x-2 gap-y-4'>
                <p>Позиция</p>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>X</label>
                    <input
                        type='number'
                        max={currentCanvas.canvasProps.width + 100}
                        value={selectedObject.left}
                        onChange={(e) => updateObject(selectedObjectId, { left: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>Y</label>
                    <input
                        type='number'
                        max={currentCanvas.canvasProps.height + 100}
                        value={selectedObject.top}
                        onChange={(e) => updateObject(selectedObjectId, { top: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <p>Размер</p>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>W</label>
                    <input
                        type='number'
                        max={currentCanvas.canvasProps.width + 100}
                        value={selectedObject.width}
                        onChange={(e) => updateObject(selectedObjectId, { width: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>H</label>
                    <input
                        type='number'
                        max={currentCanvas.canvasProps.height + 100}
                        value={selectedObject.height}
                        onChange={(e) => updateObject(selectedObjectId, { height: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='flex gap-6 items-center  col-span-2'>
                    <p>Цвет заливки</p>
                    <input
                        className='h-8 border border-gray-300 dark:border-gray-600 rounded-md w-16'
                        type="color"
                        value={selectedObject.fill}
                        onChange={(e) => updateObject(selectedObjectId, { fill: e.target.value })}
                    />
                </div>
                <div className='flex gap-4 items-center'>
                    <p>Z</p>
                    <input
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'
                        type="number"
                        min={0}
                        max={10}
                        value={selectedObject.zIndex ?? 0}
                        onChange={(e) => updateObject(selectedObjectId, { zIndex: e.target.value })}
                    />
                </div>
                <p>Stroke</p>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>W</label>
                    <input
                        type='number'
                        max='100'
                        value={selectedObject.strokeWidth}
                        onChange={(e) => updateObject(selectedObjectId, { strokeWidth: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>C</label>
                    <input
                        type='color'
                        value={selectedObject.stroke}
                        onChange={(e) => updateObject(selectedObjectId, { stroke: (e.target.value) })}
                        className='h-8 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <p>Тень</p>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>C</label>
                    <input
                        type='color'
                        value={selectedObject.shadowColor}
                        onChange={(e) => updateObject(selectedObjectId, { shadowColor: e.target.value })}
                        className='h-8 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>B</label>
                    <input
                        type='number'
                        min={0} max={100}
                        value={selectedObject.shadowBlur}
                        onChange={(e) => updateObject(selectedObjectId, { shadowBlur: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <p>Смещение тени</p>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>X</label>
                    <input
                        type='number'
                        max={currentCanvas.canvasProps.width / 2 + 100}
                        value={selectedObject.shadowOffsetX}
                        onChange={(e) => updateObject(selectedObjectId, { shadowOffsetX: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='flex gap-2 items-center justify-center'>
                    <label className='w-4 flex items-center justify-center'>Y</label>
                    <input
                        type='number'
                        max={currentCanvas.canvasProps.height / 2 + 100}
                        value={selectedObject.shadowOffsetY}
                        onChange={(e) => updateObject(selectedObjectId, { shadowOffsetY: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <p>Угол</p>
                <div className='flex gap-2 items-center justify-center'>
                    <span className='w-4'></span>
                    <input
                        type='number'
                        min={-360}max={360}
                        value={selectedObject.rotate}
                        onChange={(e) => updateObject(selectedObjectId, { rotate: parseInt(e.target.value, 10) })}
                        className='h-8 pl-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
                <div className='grid grid-cols-2 gap-4 items-center justify-end'>
                    <button onClick={() => updateRotation(selectedObjectId, -45)} className='h-8 items-center bg-blue-500 text-white rounded-md'>-</button>
                    <button onClick={() => updateRotation(selectedObjectId, 45)} className='h-8 items-center bg-red-500 text-white rounded-md'>+</button>
                </div>
                <p>Прозрачность</p>
                <input
                    type='range'
                    min={0} max={1} step={0.1}
                    value={selectedObject.opacity || 1}
                    onChange={(e) => updateObject(selectedObjectId, { opacity: (e.target.value) })}
                    className='h-8 ml-5 border border-gray-300 dark:border-gray-600 rounded-md col-span-2'
                />
            </div>
            {selectedObject.type === 'image' && selectedObject.src === '' && (
                <div className='flex justify-between px-2 gap-x-2 gap-y-4'>
                    <p>Номер изображения</p>
                    <input
                        type='number'
                        min={1} max={3}
                        value={selectedObject.numberImage}
                        onChange={(e) => updateObject(selectedObjectId, { numberImage: parseInt(e.target.value, 10) })}
                        className='h-8 px-2 border border-gray-300 dark:border-gray-600 rounded-md w-16'/>
                </div>
            )}
        </div>
    )
}

