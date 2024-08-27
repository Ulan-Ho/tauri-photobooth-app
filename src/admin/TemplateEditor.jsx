import React, { useEffect, useRef, useState } from 'react';
import { Rect, Canvas, Shadow, Triangle, Circle, Line, Text } from 'fabric';

export default function TemplateEditor({ newTemplates }) {
    const [templates, setTemplates] = useState(newTemplates || []);
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
    });




    const createRect = () => {
        let rect = new Rect({ ...objectProps });
        canvasRef.current.fabric.add(rect);
    };

    const createText = () => {
        let text = new Text('hello world', { ...objectProps, fontSize: 24 });
        canvasRef.current.fabric.add(text);
    };

    const createLine = () => {
        let line = new Line([50, 100, 400, 300], { ...objectProps, strokeWidth: 5 });
        canvasRef.current.fabric.add(line);
    };

    const createCircle = () => {
        let circle = new Circle({ ...objectProps, radius: 50 });
        canvasRef.current.fabric.add(circle);
    };

    const createTriangle = () => {
        let triangle = new Triangle({ ...objectProps });
        canvasRef.current.fabric.add(triangle);
    };



    const deleteObject = () => {
        const canvas = canvasRef.current.fabric;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
        canvas.remove(activeObject);
        }
    };




    useEffect(() => {
        if (!canvasRef.current || !(canvasRef.current instanceof HTMLCanvasElement)) return;

        const canvas = new Canvas(canvasRef.current, {
        width: 400,
        height: 600,
        backgroundColor: canvasProps.backgroundColor,
        });

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

        const resizeCanvas = () => {
        canvas.setWidth(window.innerWidth);
        canvas.setHeight(window.innerHeight);
        canvas.renderAll();
        };

        window.addEventListener("resize", resizeCanvas);

        return () => {
        window.removeEventListener("resize", resizeCanvas);
        canvas.off("object:moving", handleObjectMoving);
        canvas.off("object:scaling", handleObjectScaling);
        canvas.off("object:modified", handleObjectModified);
        canvas.off("selection:created", handleSelection);
        canvas.off("selection:updated", handleSelection);
        canvas.dispose();
        };
    }, [canvasProps]);

    const handleObjectChange = (e) => {
        const { name, value } = e.target;
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

    const handleCanvasChange = (e) => {
        const { name, value } = e.target;
        setCanvasProps((prevProps) => {
        const updatedProps = { ...prevProps, [name]: value };

        if (canvasRef.current && canvasRef.current.fabric) {
            const canvas = canvasRef.current.fabric;
            canvas.set(name, value);
            canvas.renderAll();
        }

        return updatedProps;
        });
    };

    return (
        <div className='flex'>
        <div className='flex flex-col'>
            {/* <button onClick={saveCanvas}>Save Canvas !!!</button> */}
            <button onClick={createText}>Text</button>
            <button onClick={createLine}>Line</button>
            <button onClick={createCircle}>Circle</button>
            <button onClick={createRect}>Rectangle</button>
            <button onClick={createTriangle}>Triangle</button>
            <button onClick={deleteObject}>Delete</button>
            <label>Canvas Background Color <input type="color" name="backgroundColor" value={canvasProps.backgroundColor} onChange={handleCanvasChange} /></label>
        </div>
        <canvas ref={canvasRef}></canvas>
        <div className='flex flex-col'>
            <div className='grid grid-cols-2'>
            <label>X <input type="number" name="left" value={objectProps.left.toFixed(0)} onChange={handleObjectChange} /></label>
            <label>Y <input type="number" name="top" value={objectProps.top.toFixed(0)} onChange={handleObjectChange} /></label>
            <label>Width <input type="number" name="width" value={objectProps.width.toFixed(0)} onChange={handleObjectChange} /></label>
            <label>Height <input type="number" name="height" value={objectProps.height.toFixed(0)} onChange={handleObjectChange} /></label>
            </div>
            <label>Rotate <input type="number" name="angle" value={objectProps.angle} onChange={handleObjectChange} /></label>
            <label>Fill Color <input type="color" name="fill" value={objectProps.fill} onChange={handleObjectChange} /></label>
            <label>Stroke Color <input type="color" name="stroke" value={objectProps.stroke} onChange={handleObjectChange} /></label>
            <label>Stroke Width <input type="number" name="strokeWidth" value={objectProps.strokeWidth} onChange={handleObjectChange} /></label>
            <div className='flex flex-col'>
            Shadow
            <label>Color <input type="color" name="shadow.color" value={objectProps.shadow.color} onChange={handleObjectChange} /></label>
            <label>OffsetX <input type="number" name='shadow.offsetX' value={objectProps.shadow.offsetX} onChange={handleObjectChange} /></label>
            <label>OffsetY <input type="number" name="shadow.offsetY" value={objectProps.shadow.offsetY} onChange={handleObjectChange} /></label>
            <label>Blur <input type="number" name="shadow.blur" value={objectProps.shadow.blur} onChange={handleObjectChange} /></label>
            </div>
        </div>
        </div>
    );
}


