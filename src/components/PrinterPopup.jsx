// import { invoke } from "@tauri-apps/api";
// import React, { useState, useEffect } from "react";

// export default function PrinterPopup({ onClose, onSelectPrinter }) {
//     const [printers, setPrinters] = useState([]);
//     const [selectedPrinter, setSelectedPrinter] = useState({});

//     useEffect(() => {
//         const fetchPrinters = async () => {
//             try {
//                 const printersList = await invoke('get_printers');
//                 setPrinters(printersList);
//             } catch (err) {
//                 console.log(err);
//             }
//         };
//         fetchPrinters();
//     }, []);

//     const handleSave = async () => {
//         if (selectedPrinter) {
//             // await 
//             onSelectPrinter(selectedPrinter);
//             onClose();
//         }
//     }

//     const handlePrinterChange = (printer) => {
//         const updatePrinter = printers.map((p) =>
//             p.name === printer.name ? { ...p, is_used: !p.is_used } : p
//         );
//         setPrinters(updatePrinter);
//         console.log(printers);
//         setSelectedPrinter({ ...printer, is_used: !printer.is_used });
//     }

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white rounded-lg p-6 shadow-lg w-80 h-auto">
//                 <h3 className="text-lg font-bold md-4">Выберите принтер</h3>
//                 <ul className="space-y-2">
//                     {printers.length > 0 ? (
//                         printers.map((printer) => (
//                             <li key={printer.name} className="flex items-center space-x-2" >
//                                 <input
//                                     type="radio"
//                                     name="printer"
//                                     checked={selectedPrinter?.is_used === printer.is_used}
//                                     onChange={() => {handlePrinterChange(printer)}}
//                                     className="form-radio"
//                                 />
//                                 <span>{printer.name}</span>
//                             </li>
//                         ))
//                     ) : (
//                         <li>Принтеры не найдены</li>
//                     )}
//                 </ul>
//                 <div className="mt-4 flex justify-between">
//                     <button onClick={handleSave} disabled={!selectedPrinter} className="bg-blue-500 text-white py-2 px-4 rounded:bg-gray-300">Сохранить выбор</button>
//                     <button onClick={() => onClose()} className="bg-gray-300 text-black py-2 px-4 rounded">Закрыть</button>
//                 </div>
//             </div>
//         </div>
//     )
// }
import { invoke } from "@tauri-apps/api";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function PrinterPopup({ onClose, onSelectPrinter, loading }) {
    const [printers, setPrinters] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState(null);

    useEffect(() => {
        const fetchPrinters = async () => {
            try {
                const printersList = await invoke('get_printers');
                setPrinters(printersList);
            } catch (err) {
                console.error(err);
                alert('Не удалось загрузить список принтеров.');
            }
        };
        fetchPrinters();
    }, []);

    const handleSave = async () => {
        if (selectedPrinter) {
            onSelectPrinter(selectedPrinter);
            await invoke('save_printers', { printer: selectedPrinter });
            onClose();
        }
    };

    useEffect(() => {
        if (loading) {
            onClose();
        }
    }, [loading]);

    const handlePrinterChange = (printer) => {
        setPrinters(printers.map(p => 
            ({ ...p, is_used: p.id === printer.id })
        ));
        setSelectedPrinter({ ...printer, is_used: true });
        toast.success(`Принтер ${printer.name} выбран с id ${printer.id}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-80 h-auto">
                <h3 className="text-lg font-bold mb-4">Выберите принтер</h3>
                <ul className="space-y-2">
                    {printers.length > 0 ? (
                        printers.map((printer) => (
                            <li key={printer.id} className="flex items-center space-x-2">
                                <label htmlFor={printer.id} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="printer"
                                        checked={printer.is_used}
                                        onChange={() => handlePrinterChange(printer)}
                                        className="form-radio"
                                        id={printer.id}
                                    />
                                    {printer.name}
                                </label>
                            </li>
                        ))
                    ) : (
                        <li>Принтеры не найдены</li>
                    )}
                </ul>
                <div className="mt-4 flex justify-between">
                    <button 
                        onClick={handleSave} 
                        disabled={!selectedPrinter} 
                        className={`py-2 px-4 rounded ${selectedPrinter ? 'bg-blue-500 text-white' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        Сохранить выбор
                    </button>
                    <button onClick={onClose} className="bg-gray-300 text-black py-2 px-4 rounded">Закрыть</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
