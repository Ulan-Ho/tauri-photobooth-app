import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Image, Layout, Fingerprint, Printer, Power, BarChart2 } from "lucide-react"
import { usePageNavigation } from '../App';


export default function Settings({ isDarkMode, setIsDarkMode }) {

    usePageNavigation();

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
    }


    const settingsSections = [
        // { title: "Начало", description: "Начало", link: '/', icon: Image },
        { title: "Редактор главного фона", description: "Изменение фона всего приложения", link: '/settings/editor', icon: Image },
        { title: "Редактор шаблонов", description: "Управление шаблонами", link: '/settings/template-editor', icon: Layout },
        { title: "Проверка экарана", description: "Настройка сенсорного экрана", link: '/settings/touchscreen', icon: Fingerprint },
        { title: "Проверка принтера", description: "Управление подключенным принтером", link: '/settings/printer', icon: Printer },
        { title: "Управление питанием", description: "Настройка энергосбережения", link: '/settings/timer', icon: Power },
        { title: "Cromakey", description: "Настройка зеленого фона", link: '/settings/chromakey', icon: Image },
        // { title: "Статистика", description: "Журнал действий и созданных фото", link: '/settings/statistic', icon: BarChart2 },
    ]

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="rounded-3xl border-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300" style={{width: '1000px', height: '850px'}}>
                <main className="p-8">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold">Настройки</h1>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
                            aria-label={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
                        >
                            {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
                        </button>
                    </header>

                    <div className="grid grid-cols-2 gap-8">
                        {settingsSections.map((section, index) => (
                            <div key={index} className="transition-all duration-300 hover:shadow-lg p-6 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center mb-4">
                                    <section.icon className="w-8 h-8 mr-4 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <h2 className="text-2xl font-bold">{section.title}</h2>
                                        <p className="text-lg text-gray-600 dark:text-gray-300">{section.description}</p>
                                    </div>
                                </div>
                                <Link
                                    to={section.link}
                                    className="block w-full text-center py-3 px-4 rounded-lg text-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
                                >
                                    Настроить
                                </Link>
                            </div>
                        ))}
                    </div>
                </main>
                {/* <button onClick={listen}>Listen</button> */}
            </div>
        </div>
    )
}