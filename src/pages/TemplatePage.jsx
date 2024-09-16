import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout2.jsx';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import templateTriangle from '../assets/templateTriangle.png';
import { invoke } from '@tauri-apps/api/tauri';
import { usePageNavigation } from '../App.jsx';

export default function TemplatePage({ onSelectDesign, onSelectTemplate, templates }) {
    
    usePageNavigation();

    const [selectedDesign, setSelectedDesign] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    // const [backgroundImage, setBackgroundImage] = useState(null);

    // useEffect(() => {
    //     async function fetchImage(imageName) {
    //         try {
    //             const base64Image = await invoke('get_image', { imageName });
    //             const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    //             setBackgroundImage(imageUrl);
    //         } catch (error) {
    //             console.error('Error fetching image:', error);
    //         }
    //     }

    //     fetchImage('2_bg.jpeg');
    // }, []);

    const handleDesignSelect = (design) => {
        setSelectedDesign(design);
        onSelectDesign(design);
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        onSelectTemplate(template);
    };

    const handleNext = () => {
        if (selectedDesign && selectedTemplate) navigate('/capture');
        else alert('Пожалуйста, выберите дизайн и шаблон.');
    };

    const prevSlide = () => {
        // Ваш код для переключения на предыдущий шаблон
        // Например, можно сделать так:
        setSelectedTemplate((prevTemplate) => {
            const currentIndex = templates.findIndex(t => t.id === prevTemplate);
            const prevIndex = (currentIndex > 0) ? currentIndex - 1 : templates.length - 1;
            return templates[prevIndex].id;
        });
    };

    const nextSlide = () => {
        // Ваш код для переключения на следующий шаблон
        // Например, можно сделать так:
        setSelectedTemplate((prevTemplate) => {
            const currentIndex = templates.findIndex(t => t.id === prevTemplate);
            const nextIndex = (currentIndex < templates.length - 1) ? currentIndex + 1 : 0;
            return templates[nextIndex].id;
        });
    };

    return (
        <div className="flex justify-center items-center scale-0.5">
            <div className="select-none relative" style={{width: '1280px', height: '1024px', backgroundImage: `url(src/assets/secondMainBg.jpeg)`}}>
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    <div className='w-full flex flex-col gap-9 justify-center items-center'>
                        <b className='text-5xl'>ВЫБЕРИТЕ ШАБЛОН</b>
                        <div className='flex flex-col w-full px-20'>
                            <div className='flex gap-3 items-center  justify-center'>
                                <img
                                    onClick={prevSlide}
                                    className='h-24 cursor-pointer transform -scale-x-100'
                                    src={templateTriangle}
                                    alt="Previous"
                                />
                                <div className='relative items-center box_templ'>
                                    <div className='bg_mak'></div>
                                    <div className='absolute bottom-1 left-0 w-full h-full flex gap-10 justify-center items-center z-10'>
                                        {templates.map((template) => (
                                            <div
                                                key={template.id}
                                                className={`p-1 border-4 ${selectedTemplate === template.id ? 'border-blue-500' : 'border-transparent'}`}
                                                onClick={() => handleTemplateSelect(template.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img src={template.url_png} alt={template.name} style={{ width: '300px', height: '450px' }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <img
                                    className='h-24 cursor-pointer'
                                    onClick={nextSlide}
                                    src={templateTriangle}
                                    alt="Next"
                                />
                            </div>
                            <div className='flex justify-between items-center'>
                                <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={() => navigate('/')}>
                                    <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                                </button>
                                <button
                                    onClick={() => handleDesignSelect('color')}
                                    className={`border-2 rounded-3xl px-12 py-8 bg-white ${selectedDesign === 'color' ? 'ring-4 ring-blue-500' : ''}`}
                                >
                                    <p className='w-44 text-black text-2xl font-medium'>ЦВЕТНОЕ ФОТО</p>
                                </button>
                                <button
                                    onClick={() => handleDesignSelect('grayscale')}
                                    className={`border-2 rounded-3xl px-12 py-8 bg-white ${selectedDesign === 'grayscale' ? 'ring-4 ring-blue-500' : ''}`}
                                >
                                    <p className='w-44 text-black text-2xl font-medium'>ЧЕРНО-БЕЛОЕ ФОТО</p>
                                </button>
                                <button className='cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white text-2xl bg-red-700' onClick={handleNext}>
                                    ДАЛЕЕ <img className='w-5' src={templateTriangle} alt="Forward" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
