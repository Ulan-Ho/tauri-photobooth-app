import { invoke } from '@tauri-apps/api';
import { toast } from 'react-toastify';

export async function saveCanvasData(canvasId, canvasData) {
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

export async function saveCanvasImage(canvasId, canvasData, canvasRef) {
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
        toast.success('Изображение сохранено');
        console.log('Canvas image saved successfully.');
        } catch (error) {
        console.error('Failed to save canvas image:', error);
    }
}