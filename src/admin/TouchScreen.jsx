import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Fingerprint, ArrowLeft } from "lucide-react"

export default function TouchScreen({ isDarkMode }) {
    const [touches, setTouches] = useState([]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
        root.classList.add("dark");
        } else {
        root.classList.remove("dark");
        }
    }, [isDarkMode]);

    const handleTouchStart = (event) => {
        if (event.touches) {
        setTouches([...event.touches]);
        }
    };

    const handleTouchMove = (event) => {
        if (event.touches) {
        setTouches([...event.touches]);
        }
    };

    const handleTouchEnd = () => {
        setTouches([]);
    };

    useEffect(() => {
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="rounded-3xl border-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300" style={{width: '1000px', height: 'auto'}}>
            <main className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                    <Link to="/settings" className="mr-4">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl font-bold">Проверка пальцев</h1>
                    </div>
                    <Fingerprint className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </header>

                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h2 className="text-2xl font-bold mb-4">Проверка сенсорного экрана</h2>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">Коснитесь экрана в разных местах, чтобы проверить его работоспособность.</p>
                    <div className="relative w-full h-96 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    {touches.map((touch, index) => (
                        <div 
                        key={index}
                        className="absolute bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-200"
                        style={{
                            width: '20px',
                            height: '20px',
                            left: `${touch.clientX - 10}px`,
                            top: `${touch.clientY - 10}px`
                        }}
                        />
                    ))}
                    </div>
                    <div className="mt-4 text-lg">
                    <p>Количество точек касания: <span className="font-bold">{touches.length}</span></p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Link 
                    to="/settings"
                    className="px-6 py-3 rounded-lg text-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
                    >
                    Назад к настройкам
                    </Link>
                </div>
            </main>
        </div>
        </div>
    )
}