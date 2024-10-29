import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Printer, ArrowLeft } from "lucide-react"
import { usePageNavigation } from '../App';
import { invoke } from '@tauri-apps/api';
import { toast, ToastContainer } from 'react-toastify';
import AdminShell from '../components/AdminShell';

const props = {
    page: 'Проверка принтера',
    type: 'printer'
}

export default function PrinterInfo({ isDarkMode }) {

    usePageNavigation();

    useEffect(() => {
        async function getPrinterList() {
            try {
                const response = await invoke('get_printer_list');
                response.map(printer => {
                    toast.success(`Printer: ${printer}`);
                    // toast.success(`Printer: ${printer}`);
                    // toast.success(`Printer: ${printer}`);
                    // const printer_driver = await invoke('get_printer_driver', { printerName: printer });
                    // toast(`Printer: ${printer}, Driver: ${printer_driver}`);
                    fetchPrinterDrivers(printer);
                    
                })
            } catch (error) {
                toast.error(`Error: ${error}`);
            }
        }


        async function fetchPrinterDrivers(printerName) {
            try {
                const printer_driver = printerName;
                const response = await invoke('get_printer_driver', { printerName: printer_driver });
                toast.success(`Printer Drivers: ${response}`);
            } catch (error) {
                toast.error(`Error: ${error}`);
            }
        }
      

    
        getPrinterList();
    }, []);
    

    return (
        <AdminShell props={props}>
            <div className="grid grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <h2 className="text-2xl font-bold mb-4">Информация о принтере</h2>
                <div className="space-y-4">
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Статус</p>
                    <p className="text-lg font-medium">null</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Серийный номер</p>
                    <p className="text-lg font-medium">null</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CVD</p>
                    <p className="text-lg font-medium">null</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Размер медиа</p>
                    <p className="text-lg font-medium">null</p>
                    </div>
                </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <h2 className="text-2xl font-bold mb-4">Счетчики</h2>
                <div className="space-y-4">
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Счетчик жизни</p>
                    <p className="text-lg font-medium">nullnull</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Счетчик A (5x7)</p>
                    <p className="text-lg font-medium">nullnull</p>
                    </div>
                    <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Счетчик B (6x8)</p>
                    <p className="text-lg font-medium">nullnull</p>
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
                    <span>null%</span>
                    </div>
                    {/* <Progress value={printerData.paperRemaining} className="w-full" /> */}
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                    <span>Чернила</span>
                    <span>null%</span>
                    </div>
                    {/* <Progress value={printerData.inkRemaining} className="w-full" /> */}
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                    <span>Медиа</span>
                    <span>null%</span>
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

            <ToastContainer />
        </AdminShell>
    )
}