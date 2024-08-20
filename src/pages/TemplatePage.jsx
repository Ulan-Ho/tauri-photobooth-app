import React, { useState } from 'react';
import Layout from '../components/Layout2.jsx';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import templateTriangle from '../assets/templateTriangle.png';

export default function TemplatePage({ onSelectDesign, onSelectTemplate, templates }) {
    const navigate = useNavigate();
    const [selectedDesign, setSelectedDesign] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

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
        <Layout>
            <div className='flex flex-col gap-20 justify-center items-center'>
                <h1 className='text-5xl'>Выберите шаблон</h1>
                <div className='flex gap-4 flex-col'>
                    <div className='flex justify-between items-center'>
                        <img
                            onClick={prevSlide}
                            className='h-24 cursor-pointer transform -scale-x-100'
                            src={templateTriangle}
                            alt="Previous"
                        />
                        <div className='relative items-center box_templ'>
                            <div className='bg_mak'></div>
                            <div className='absolute bottom-1 left-0 w-full h-full flex gap-10 justify-center items-center text-white text-2xl z-10'>
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className={`p-1 border-4 ${selectedTemplate === template.id ? 'border-blue-500' : 'border-transparent'}`}
                                        onClick={() => handleTemplateSelect(template.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img src={template.url_png} alt={template.name} style={{ width: '250px', height: '400px' }} />
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
                    <div className='flex gap-20 justify-center items-center'>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white' onClick={() => navigate('/')}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                        <button
                            onClick={() => handleDesignSelect('color')}
                            className={`border-2 rounded-3xl px-16 py-12 bg-white ${selectedDesign === 'color' ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <p className='w-44 text-black'>ЦВЕТНОЕ ФОТО</p>
                        </button>
                        <button
                            onClick={() => handleDesignSelect('grayscale')}
                            className={`grayscale border-2 rounded-3xl px-16 py-12 bg-white ${selectedDesign === 'grayscale' ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <p className='w-44 text-black'>ЧЕРНО-БЕЛОЕ ФОТО</p>
                        </button>
                        <button className='cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white' onClick={handleNext}>
                            ВПЕРЕД <img className='w-5' src={templateTriangle} alt="Forward" />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
