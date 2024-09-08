import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowLeft } from "lucide-react";
import Switch from 'react-switch';
import '../App.css'
import { invoke } from "@tauri-apps/api/tauri";
import { toast, ToastContainer } from "react-toastify";

export default function Timer() {
    const [isAlwaysOn, setIsAlwaysOn] = useState(false);
    const [workhours, setWorkhours] = useState({ start: '09:00', end: '21:00' });

    const handleWorkHoursChange = (type, value) => {
        setWorkhours( prev => ({ ...prev, [type]: value }));
    }

    const loadWorkHours = async () => {
        try {
            const hours = await invoke("get_work_hours");
            setWorkhours(hours);
            toast(hours)
        } catch (error) {
            console.error("Failed to load work hours:", error);
        }
    };


    const saveSchedule = async () => {
        try {
            await invoke("set_work_hours", { start: workhours.start, end: workhours.end });
            toast("Schedule saved successfully");
        } catch (error) {
            toast.error("Failed to save schedule");
        }
    }


    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="rounded-3xl border-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300" style={{width: '1000px', height: '800px'}}>
                <main className="p-8">
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center">
                            <Link to='/settings' className="mr-4">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <h1 className="text-4xl font-bold">Время работы фотобудки</h1>
                        </div>
                        <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </header>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <label htmlFor="always-on" className="text-lg">Работать круглосуточно</label>
                            <Switch
                                id="always-on"
                                checked={isAlwaysOn}
                                onChange={setIsAlwaysOn}
                                offColor="#ccc"
                                onColor="#4caf50"
                                handleDiameter={20}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={24}
                                width={42}
                                className="react-switch"
                            />
                        </div>

                        {isAlwaysOn && (
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label htmlFor="startTime" className="text-lg">Время начала работы</label>
                                    <input
                                        type="time"
                                        name=""
                                        id="startTime"
                                        value={workhours.start}
                                        onChange={(e) => handleWorkHoursChange('start', e.target.value)}
                                        className="text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="endTime" className="text-lg">Время окончания работы</label>
                                    <input
                                        type="time"
                                        name=""
                                        id="endTime"
                                        value={workhours.end}
                                        onChange={(e) => handleWorkHoursChange('end', e.target.value)}
                                        className="text-lg"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-b-lg">
                            <h2 className="text-lg font-semibold mb-2">Текущее расписание:</h2>
                            <p className="text-lg">
                                {isAlwaysOn
                                    ? "Фотобудка работает круглосуточно"
                                    : `Фотобудка работает с ${workhours.start} до ${workhours.end}`
                                }
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button>
                            <Link to='/settings'>Отмена</Link>
                        </button>
                        <button onClick={saveSchedule}>Сохранить расписание</button>
                    </div>
                    <button onClick={loadWorkHours}>Update</button>
                </main>
            </div>
            <ToastContainer />
        </div>
    )
}