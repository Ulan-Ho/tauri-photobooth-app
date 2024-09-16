import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft } from "lucide-react"
import { usePageNavigation } from '../App';

export default function PrinterInfo({ isDarkMode }) {

    usePageNavigation();

  // Mock printer data - replace with actual data fetching logic
    const printerData = {
        mediaSize: "6x8",
        mediaRemaining: 80,
        lifeCounter: 15000,
        counterA: 5000,
        counterB: 10000,
        status: "Ready",
        cvd: "1.2.3",
        serialNumber: "SN123456789",
        paperRemaining: 75,
        inkRemaining: 60
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="rounded-3xl border-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300" style={{width: '1000px', height: 'auto'}}>
                <main className="p-8">
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center">
                        <Link to="/settings" className="mr-4">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-4xl font-bold">Проверка принтера</h1>
                        </div>
                        <Printer className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </header>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h2 className="text-2xl font-bold mb-4">Информация о принтере</h2>
                        <div className="space-y-4">
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Статус</p>
                            <p className="text-lg font-medium">{printerData.status}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Серийный номер</p>
                            <p className="text-lg font-medium">{printerData.serialNumber}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">CVD</p>
                            <p className="text-lg font-medium">{printerData.cvd}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Размер медиа</p>
                            <p className="text-lg font-medium">{printerData.mediaSize}</p>
                            </div>
                        </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h2 className="text-2xl font-bold mb-4">Счетчики</h2>
                        <div className="space-y-4">
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Счетчик жизни</p>
                            <p className="text-lg font-medium">{printerData.lifeCounter}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Счетчик A (5x7)</p>
                            <p className="text-lg font-medium">{printerData.counterA}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Счетчик B (6x8)</p>
                            <p className="text-lg font-medium">{printerData.counterB}</p>
                            </div>
                        </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                        <h2 className="text-2xl font-bold mb-4">Расходные материалы</h2>
                        <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                            <span>Бумага</span>
                            <span>{printerData.paperRemaining}%</span>
                            </div>
                            {/* <Progress value={printerData.paperRemaining} className="w-full" /> */}
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                            <span>Чернила</span>
                            <span>{printerData.inkRemaining}%</span>
                            </div>
                            {/* <Progress value={printerData.inkRemaining} className="w-full" /> */}
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                            <span>Медиа</span>
                            <span>{printerData.mediaRemaining}%</span>
                            </div>
                            {/* <Progress value={printerData.mediaRemaining} className="w-full" /> */}
                        </div>
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