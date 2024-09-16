import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, ArrowLeft, Type, Minus, Circle, Square, Triangle, Trash2, Save, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Rect, Canvas, Shadow, Triangle as FabricTriangle, Circle as FabricCircle, Line, Text } from 'fabric';
import * as Tabs from '@radix-ui/react-tabs';
import { usePageNavigation } from '../App';

export default function TemplateEditor({ initialTemplates = [], isDarkMode }) {

    usePageNavigation();

    const [templates, setTemplates] = useState(initialTemplates);
    const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
    const canvasRef = useRef(null);
    const [objectProps, setObjectProps] = useState({
        left: 100,
        top: 100,
        fill: '#ff0000',
        width: 200,
        height: 100,
        angle: 0,
        stroke: '#000000',
        strokeWidth: 1,
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        flipX: false,
        flipY: false,
        shadow: new Shadow({
            color: '#000000',
            blur: 5,
            offsetX: 5,
            offsetY: 5,
        }),
    });

    const [canvasProps, setCanvasProps] = useState({
        backgroundColor: '#f0f0f0',
        width: 400,
        height: 600,
    });

    useEffect(() => {
        if (!canvasRef.current || !(canvasRef.current instanceof HTMLCanvasElement)) return;

        const canvas = new Canvas(canvasRef.current, canvasProps);
        canvasRef.current.fabric = canvas;

        const updateObjectProps = (obj) => {
            setObjectProps({
                left: obj.left,
                top: obj.top,
                fill: obj.fill,
                width: obj.width * obj.scaleX,
                height: obj.height * obj.scaleY,
                angle: obj.angle,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                opacity: obj.opacity,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                flipX: obj.flipX,
                flipY: obj.flipY,
                shadow: obj.shadow,
            });
        };

        const handleObjectMoving = (e) => updateObjectProps(e.target);
        const handleObjectScaling = (e) => updateObjectProps(e.target);
        const handleObjectModified = (e) => updateObjectProps(e.target);
        const handleSelection = (e) => {
            const activeObject = e.target;
            if (activeObject) {
                updateObjectProps(activeObject);
            }
        };

        canvas.on("object:moving", handleObjectMoving);
        canvas.on("object:scaling", handleObjectScaling);
        canvas.on("object:modified", handleObjectModified);
        canvas.on("selection:created", handleSelection);
        canvas.on("selection:updated", handleSelection);
        canvas.on('object:selected', handleSelection);

        if (templates[currentTemplateIndex]) {
            canvas.loadFromJSON(templates[currentTemplateIndex], canvas.renderAll.bind(canvas));
        }

        return () => {
            canvas.off("object:moving", handleObjectMoving);
            canvas.off("object:scaling", handleObjectScaling);
            canvas.off("object:modified", handleObjectModified);
            canvas.off("selection:created", handleSelection);
            canvas.off("selection:updated", handleSelection);
            canvas.dispose();
        };
    }, [canvasProps, currentTemplateIndex, templates]);

    const createShape = (shapeType) => {
        let shape;
        switch (shapeType) {
            case 'text':
                shape = new Text('hello world', { ...objectProps, fontSize: 24 });
                break;
            case 'line':
                shape = new Line([50, 100, 400, 300], { ...objectProps, strokeWidth: 5 });
                break;
            case 'circle':
                shape = new FabricCircle({ ...objectProps, radius: 50 });
                break;
            case 'rectangle':
                shape = new Rect({ ...objectProps });
                break;
            case 'triangle':
                shape = new FabricTriangle({ ...objectProps });
                break;
            default:
                return;
        }
        canvasRef.current.fabric.add(shape);
    };

    const deleteObject = () => {
        const canvas = canvasRef.current.fabric;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
        }
    };

    const saveCanvas = async () => {
        const canvas = canvasRef.current.fabric;
        const template = canvas.toJSON();
        setTemplates((prevTemplates) => {
            const newTemplates = [...prevTemplates];
            newTemplates[currentTemplateIndex] = template;
            return newTemplates;
        });
        console.log('Template saved:', template);
    };

    const createNewCanvas = () => {
        const newTemplate = {
            version: "5.3.0",
            objects: [],
            background: canvasProps.backgroundColor,
        };
        setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
        setCurrentTemplateIndex(templates.length);
    };

    const handleObjectChange = (name, value) => {
        const parsedValue = parseFloat(value) || value;

        setObjectProps((prevProps) => {
            const updatedProps = { ...prevProps, [name]: parsedValue };

            if (canvasRef.current && canvasRef.current.fabric) {
                const canvas = canvasRef.current.fabric;
                const activeObject = canvas.getActiveObject();

                if (activeObject) {
                    activeObject.set(updatedProps);
                    activeObject.setCoords();
                    canvas.renderAll();
                }
            }

            return updatedProps;
        });
    };

    const handleCanvasChange = (name, value) => {
        setCanvasProps((prevProps) => {
            const updatedProps = { ...prevProps, [name]: value };

            if (canvasRef.current && canvasRef.current.fabric) {
                const canvas = canvasRef.current.fabric;
                canvas.set(name, value);
                canvas.setDimensions({ width: updatedProps.width, height: updatedProps.height });
                canvas.renderAll();
            }

            return updatedProps;
        });
    };

    const navigateTemplate = (direction) => {
        let newIndex = currentTemplateIndex + direction;
        if (newIndex < 0) newIndex = templates.length - 1;
        if (newIndex >= templates.length) newIndex = 0;
        setCurrentTemplateIndex(newIndex);
    };

    return (
        <div className='min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
            <div className='rounded-3xl border-8 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300' style={{ width: '1200px', height: '800px' }}>
                <main className='p-8'>
                    <header className='flex justify-between items-center mb-8'>
                        <div className='flex items-center'>
                            <Link to='/settings' className='mr-4'>
                                <ArrowLeft className='w-6 h-6' />
                            </Link>
                            <h1 className='text-4xl font-bold'>Редактор шаблонов</h1>
                        </div>
                        <Layout className='w-12 h-12 text-blue-600 dark:text-blue-400' />
                    </header>
                    <div className='flex gap-8'>
                        <div className='w-2/3'>
                            <div className='flex justify-between items-center mb-4'>
                                <button onClick={() => navigateTemplate(-1)}><ChevronLeft className='h-4 w-4' /></button>
                                <span>Шаблон {currentTemplateIndex + 1} из {templates.length}</span>
                                <button onClick={() => navigateTemplate(1)}><ChevronRight className='h-4 w-4' /></button>
                            </div>
                            <canvas ref={canvasRef} className='border border-gray-300 dark:border-gray-600 rounded-lg' />
                        </div>
                        <div className='w-1/3'>
                            <Tabs.Root defaultValue='shapes' className='w-full flex gap-5 flex-col'>
                                <Tabs.List className='grid w-full grid-cols-3 bg-gray-50 dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600'>
                                    <Tabs.Trigger className='data-[state=active]:bg-white data-[state=active]:rounded-md data-[state=active]:border data-[state=active]:p-1 data-[state=active]:dark:bg-gray-500' value='shapes'>Фигуры</Tabs.Trigger>
                                    <Tabs.Trigger className='data-[state=active]:bg-white data-[state=active]:rounded-md data-[state=active]:border data-[state=active]:p-1 data-[state=active]:dark:bg-gray-500' value='properties'>Свойства</Tabs.Trigger>
                                    <Tabs.Trigger className='data-[state=active]:bg-white data-[state=active]:rounded-md data-[state=active]:border data-[state=active]:p-1 data-[state=active]:dark:bg-gray-500' value='canvas'>Холст</Tabs.Trigger>
                                </Tabs.List>
                                <Tabs.Content value='shapes'>
                                    <div className='flex flex-wrap gap-2'>
                                        <button onClick={() => createShape('text')} className='bg-white dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-lg shadow-md'>
                                            <Type />
                                        </button>
                                        <button onClick={() => createShape('line')} className='bg-white dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-lg shadow-md'>
                                            <Minus />
                                        </button>
                                        <button onClick={() => createShape('circle')} className='bg-white dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-lg shadow-md'>
                                            <Circle />
                                        </button>
                                        <button onClick={() => createShape('rectangle')} className='bg-white dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-lg shadow-md'>
                                            <Square />
                                        </button>
                                        <button onClick={() => createShape('triangle')} className='bg-white dark:bg-gray-600 text-gray-800 dark:text-white p-2 rounded-lg shadow-md'>
                                            <Triangle />
                                        </button>
                                        <button onClick={deleteObject} className='bg-red-600 text-white p-2 rounded-lg shadow-md'>
                                            <Trash2 />
                                        </button>
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value='properties'>
                                    <div>
                                        {Object.keys(objectProps).map(key => (
                                            <div key={key} className='flex justify-between items-center mb-2'>
                                                <label>{key}</label>
                                                <input type='text' value={objectProps[key]} onChange={(e) => handleObjectChange(key, e.target.value)} className='p-1 border border-gray-300 dark:border-gray-600 rounded-md' />
                                            </div>
                                        ))}
                                    </div>
                                </Tabs.Content>
                                <Tabs.Content value='canvas'>
                                    <div>
                                        {Object.keys(canvasProps).map(key => (
                                            <div key={key} className='flex justify-between items-center mb-2'>
                                                <label>{key}</label>
                                                <input type='text' value={canvasProps[key]} onChange={(e) => handleCanvasChange(key, e.target.value)} className='p-1 border border-gray-300 dark:border-gray-600 rounded-md' />
                                            </div>
                                        ))}
                                    </div>
                                </Tabs.Content>
                            </Tabs.Root>
                        </div>
                    </div>
                    <footer className='mt-8 flex justify-between'>
                        <button onClick={saveCanvas} className='bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md'>
                            <Save className='inline mr-2' />
                            Сохранить шаблон
                        </button>
                        <button onClick={createNewCanvas} className='bg-green-600 text-white px-4 py-2 rounded-lg shadow-md'>
                            <Plus className='inline mr-2' />
                            Новый шаблон
                        </button>
                    </footer>
                </main>
            </div>
        </div>
    );
}
