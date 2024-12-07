import { NavLink, resolvePath, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import '../App.css';
import main_icon from '../assets/main_icon.png';
import back_img from '../assets/defaultImage.jpeg';
import { toast,ToastContainer } from "react-toastify";
import { usePageNavigation } from "../App";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "../admin/store";
// import ChromakeyTest from "../ChromaKeyTest";
// import image_beta from '../image_beta/IMG_6700.JPG'
import { saveCanvasData, saveCanvasImage } from "../admin/TemplateEditor"
import { drawMyCanvas } from "../components/CanvasDrawer";

export default function MainPage({ active, loading, setLoading }) {
    const { setCanvasData, updateStatus, setUpdated, currentCanvasId, canvases, switchCanvas } = useStore();
    // const currentCanvas = canvases.find(canvas => canvas.id === currentCanvasId);
    const [bgImage, setBgImage] = useState(localStorage.getItem("back_1") || `url(${back_img})`);
    const canvasRefForSelect = useRef(null);
    usePageNavigation();

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const image = await invoke('get_image', { imageName: '1_bg.jpeg' });
                const url_image = `url(data:image/jpeg;base64,${image})`;
                setBgImage(url_image);
                localStorage.setItem("back_1", url_image);
            } catch (err) {
                console.log(err);
            }
        };

        const storedBg = localStorage.getItem("back_1");
        if(!storedBg || storedBg.trim() === "") {
            fetchImage();
        } else {
            setBgImage(localStorage.getItem("back_1"))
        }
    },[]);

    const fetchTemplate = async() => {
        try {
            if (updateStatus === false) {
                const canvasArray = await invoke('load_all_canvas_data');
                switchCanvas(1); // Switch to the first canvas
                setCanvasData(canvasArray);
                console.log(canvasArray)
                const canvas = canvasRefForSelect.current;
                const ctx = canvas.getContext('2d');
                canvases.map(async (canva) => {
                    if (canva) {
                        drawMyCanvas(ctx, canvas, canva, false);
                        drawMyCanvas(ctx, canvas, canva, false);
                    }
                    canva.objects.map((obj) => {
                        if (obj.type === 'image' && ( obj.numberImage === 1 ||  obj.numberImage === 3  || obj.numberImage === 2  )) obj.imgObject = '';
                        // console.log('nice')
                    });
                    canva.canvasProps.webpData = canvasRefForSelect.current.toDataURL('image/webp');
                    saveCanvasData(canva.id, canva);
                    saveCanvasImage(canva.id, canva, canvasRefForSelect);
                })
                
            }
        } catch (err) {
            console.log(err);
        }
    }

    const loadingAppSettings = async () => {
        try {
            if (loading === false) {
                await invoke('update_selected_printer');
                setLoading(true);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchTemplate();
        fetchTemplate();
        loadingAppSettings();
    }, [updateStatus]);

    return (
        <div className={`${active == true ? "pointer-events-none": "pointer-events-auto"} flex justify-center items-center`}>
            <div className="select-none relative  bg-cover bg-center bg-no-repeat" style={{width: '1280px', height: '1024px', backgroundImage: bgImage}}>
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    <div className="flex flex-col">
                        <NavLink to='/template'><img src={main_icon} alt="camera icon" /></NavLink>
                        {/* <ChromakeyTest image={image_beta} backgroundImage={back_img} /> */}
                        <div style={word}>НАЧАТЬ ФОТОСЕССИЮ </div>
                        {!updateStatus && <canvas ref={canvasRefForSelect} style={{ width: '413.3px', height: '614.6px', display: 'none'}} />}

                        {/* <NavLink to='/settings' className="text-black">Settings</NavLink> */}
                        {/* <div className="text-black">{appPath}</div> */}

                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}

const link = {
    position: 'absolute',
    top: '330px',
    left: '30%',
    width: '400px',
    // height: '340px',
    borderRadius: '15px',
    backgroundSize: 'cover',
}

const word = {
    position: 'absolute',
    top: '70%',
    left: '35%',
    color: 'white',
    textAlign: 'center',
    fontSize: '50px',
    lineHeight: '1.3',
    width: '400px',
    height: '200px',
}