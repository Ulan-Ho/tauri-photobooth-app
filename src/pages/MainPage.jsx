import { Link, NavLink, resolvePath, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import '../App.css';
import main_icon from '../assets/main_icon.png';
import back_img from '../assets/defaultImage.jpeg';
import { toast,ToastContainer } from "react-toastify";
import { usePageNavigation } from '../hooks/usePageNavigation.js';
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "../admin/store";
// import ChromakeyTest from "../ChromaKeyTest";
// import image_beta from '../image_beta/IMG_6700.JPG'
import { saveCanvasData, saveCanvasImage } from "../utils/canvasUtils";
import { drawMyCanvas } from "../components/CanvasDrawer";
import { Settings } from "lucide-react"
import { set } from "lodash";

export default function MainPage({ active, loading, setLoading }) {
    const { setCanvasData, updateStatus, setUpdateStatus, currentCanvasId, canvases, switchCanvas, chromokeyBackgroundImage, setChromokeyColor, setCounterCapturePhoto, backgroundImage, chromokeyStatus, setBackgroundImage, currentProject, setCurrentProject } = useStore();
    const currentCanvas = canvases.find(canvas => canvas.id === currentCanvasId);
    const [bgImage, setBgImage] = useState(localStorage.getItem("back_1") || `url(${back_img})`);
    const canvasRefForSelect = useRef(null);
    const navigate = useNavigate();
    // const [image, setImage] = useState('');
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
            // const base64Image = await invoke('get_last_saved_image');
            // if (base64Image) {
            //     const url_image = `url(data:image/jpeg;base64,${base64Image})`;
            //     setImage(url_image);
            // }
            if (updateStatus === false) {
                const backgroundImageInBase64 = await invoke('get_background_image');
                setBackgroundImage(backgroundImageInBase64);
                const canvasArray = await invoke('load_all_canvas_data');
                if (!canvasArray || canvasArray.length === 0) {
                    console.log("No templates found. Exiting function.");
                    return; // Завершаем выполнение функции, если массив пустой
                }
                switchCanvas(1); // Switch to the first canvas
                setCanvasData(canvasArray);
                const canvas = canvasRefForSelect.current;
                const ctx = canvas.getContext('2d');
                canvasArray.map(async (canva) => {
                    if (canva) {
                        // drawMyCanvas(ctx, canvas, canva, false);
                        drawMyCanvas(ctx, canvas, canva, false, chromokeyStatus === true ? chromokeyBackgroundImage : backgroundImage, false);
                        drawMyCanvas(ctx, canvas, canva, false, chromokeyStatus === true ? chromokeyBackgroundImage : backgroundImage, false);
                        // drawMyCanvas(ctx, canvas, canva, false);
                    }
                    canva.objects.map((obj) => {
                        if (( obj.numberImage === 1 ||  obj.numberImage === 3  || obj.numberImage === 2  )) obj.imgObject = '';
                    });
                    canva.canvasProps.webpData = canvasRefForSelect.current.toDataURL('image/webp');
                    // saveCanvasData(canva.id, canva);
                    // saveCanvasImage(canva.id, canva, canvasRefForSelect);
                })
                setUpdateStatus(true);
            }
            const settings = await invoke('read_settings');

            if (settings) {
                setChromokeyColor(settings.color);
                setCounterCapturePhoto(settings.counter);
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

    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const projectList = await invoke('get_projects');
                setProjects(projectList);
                
            } catch (err) {
                console.error(err);
                alert('Не удалось загрузить список проектов.');
            }
        };
        fetchProjects();
    }, []);

    const handleSave = async () => {
        if (selectedProject) {
            try {
                await invoke('save_projects', {
                    projects: projects, // Передаем весь список проектов
                    selectedProjectId: selectedProject.id, // ID выбранного проекта
                });
                setCurrentProject(false);
                toast.success("Сохранено успешно!");
                await invoke('save_projects_and_create_dir', {projects});
                await invoke('init_project_path');
            } catch (err) {
                console.error(err);
                alert("Не удалось сохранить проекты.");
            }
        } else {
            alert("Выберите проект перед сохранением.");
        }
    };
    


    const handlePrinterChange = (id) => {
        setProjects((prevProjects) => 
            prevProjects.map((project) => ({
                ...project,
                is_used: project.id === id, // Только у выбранного проекта is_used = true
            }))
        );
    
        const selected = projects.find((project) => project.id === id);
        setSelectedProject(selected ? { ...selected, is_used: true } : null);
    };

    const addProject = () => {
        if (newProjectName.trim()) {
            const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
            setProjects([...projects, { id: newId, name: newProjectName.trim(), is_used: false }]);
            setNewProjectName("");
        }
    };

    const removeProject = (id) => {
        setProjects((prevProjects) => {
            const updatedProjects = prevProjects.filter((project) => project.id !== id);
    
            // Сбрасываем выбранный проект, если он был удален
            if (selectedProject?.id === id) {
                setSelectedProject(null);
            }
    
            return updatedProjects;
        });
    };
    
    return (
        <div className={`${active == true ? "pointer-events-none": "pointer-events-auto"} flex justify-center items-center`}>
            <div className="select-none relative  bg-cover bg-center bg-no-repeat" style={{width: '1280px', height: '1024px', backgroundImage: bgImage}}>
                <div className='back-img'></div>
                {currentProject ? (
                <div className="block block-first" style={{position: 'absolute', width: '800px', top: '300px', left: '350px', backgroundColor: 'white'}}>
                    <h2 style={{fontSize: '22px', fontWeight: 'bold', textAlign: 'center'}}>Выберите проект</h2>
                    <ul className="px-2 gap-x-2 gap-y-4 flex flex-col overflow-auto min-h-24 max-h-80">
                        {projects.map((project) => (
                            <li key={project.id} className="project-item flex justify-between items-center py-2 border-b" >
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="selectedProject"
                                        checked={project.is_used}
                                        onChange={() => handlePrinterChange(project.id)}
                                    />
                                    <span onClick={() => handlePrinterChange(project.id)} style={{cursor: 'pointer'}}>{project.name}</span>
                                </div>
                                <button onClick={() => removeProject(project.id)} className="delete-button bg-red-500 text-white px-2 py-1 rounded-md">
                                    Удалить
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="create-project mt-4">
                        <input
                            type="text"
                            placeholder="Введите имя проекта"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="project-input border px-2 py-1 rounded-md mr-2"
                        />
                        <button onClick={addProject} className="create-button bg-blue-500 text-white px-4 py-1 rounded-md">
                            Создать проект
                        </button>
                    </div>

                    <button onClick={handleSave} className="confirm-button mt-4 bg-green-500 text-white px-6 py-2 rounded-md">
                        Подтвердить
                    </button>
                </div>
                ) : (
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    {/* <img src={image} alt="" /> */}
                    <div className="flex flex-col">
                        <NavLink to='/settings' className="absolute left-10 top-10 z-10 opacity-0 hover:opacity-100">
                            <Settings size={30} /> {/* Отображаем иконку шестеренки */}
                        </NavLink>
                        <NavLink to='/template'><img src={main_icon} alt="camera icon" /></NavLink>
                        {/* <ChromakeyTest image={image_beta} backgroundImage={back_img} /> */}
                        <div style={word}><button onClick={() => navigate('/template')} >НАЧАТЬ ФОТОСЕССИЮ</button></div>
                        {/* {!updateStatus && <canvas ref={canvasRefForSelect} style={{ width: '413.3px', height: '614.6px', display: 'none'}} />} */}
                        <canvas ref={canvasRefForSelect} style={{ width: '413.3px', height: '614.6px', display: 'none'}} />
                        {/* <NavLink to='/settings' className="text-black">Settings</NavLink> */}
                        {/* <div className="text-black">{appPath}</div> */}

                    </div>
                </div>
                ) }
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