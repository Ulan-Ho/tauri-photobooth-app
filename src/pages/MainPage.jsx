import { Link, NavLink, resolvePath, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import '../App.css';
import main_icon from '../assets/main_icon.png';
import back_img from '../assets/defaultImage.jpeg';
import { toast,ToastContainer } from "react-toastify";
import { usePageNavigation } from '../hooks/usePageNavigation.js';
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { useStore } from "../admin/store";
// import ChromakeyTest from "../ChromaKeyTest";
// import image_beta from '../image_beta/IMG_6700.JPG'
import { saveCanvasData, saveCanvasImage } from "../utils/canvasUtils";
import { drawMyCanvas } from "../components/CanvasDrawer";
import { Settings } from "lucide-react"
import { set } from "lodash";
import printer from "../assets/printer.png";

export default function MainPage({ active, loading, setLoading, setActive }) {
    const { project, setProject, chromokey, setChromokey, reference, setReferences, setCamera, setCanvasData, currentCanvasId, canvases, switchCanvas, chromokeyBackgroundImage, setChromokeyColor, setCounterCapturePhoto, backgroundImage, chromokeyStatus, setBackgroundImage, currentProject, setCurrentProject } = useStore();
    const currentCanvas = canvases.find(canvas => canvas.id === currentCanvasId);
    const [bgImage, setBgImage] = useState(localStorage.getItem("back_1") || `url(${back_img})`);
    const canvasRefForSelect = useRef(null);
    const navigate = useNavigate();
    // const [image, setImage] = useState('');
    usePageNavigation();

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const image = await invoke('get_image_path', { path: `background/1_background` })
                const url_image = `url(${convertFileSrc(image)})`;
                setBgImage(url_image);
                if (image && image.trim() !== "") {
                    setBgImage(url_image);
                    localStorage.setItem("back_1", url_image);
                } else {
                    throw new Error("Изображение не найдено");
                }
            } catch (err) {
                localStorage.removeItem("back_1");
                setBgImage(`url(${back_img})`);
                console.log(err);
            }
        };

        fetchImage();
    },[]);

    const fetchTemplate = async() => {
        try {
            // const base64Image = await invoke('get_last_saved_image');
            // if (base64Image) {
            //     const url_image = `url(data:image/jpeg;base64,${base64Image})`;
            //     setImage(url_image);
            // }
            if (project.updateStatus === false) {
                const backgroundImageInBase64 = await invoke('get_image_path', { path: `settings/references_image` });
                setReferences({ src: convertFileSrc(backgroundImageInBase64) });
                console.log(reference.src);
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
                        drawMyCanvas(ctx, canvas, canva, false, chromokey.isEnabled === true ? chromokey.backgroundImage : reference, false);
                        drawMyCanvas(ctx, canvas, canva, false, chromokey.isEnabled === true ? chromokey.backgroundImage : reference, false);
                        // drawMyCanvas(ctx, canvas, canva, false);
                    }
                    canva.objects.map((obj) => {
                        if (( obj.numberImage === 1 ||  obj.numberImage === 3  || obj.numberImage === 2  )) obj.imgObject = '';
                    });
                    canva.canvasProps.webpData = canvasRefForSelect.current.toDataURL('image/webp');
                    // saveCanvasData(canva.id, canva);
                    // saveCanvasImage(canva.id, canva, canvasRefForSelect);
                })
                setProject({ updateStatus: true });
            }
            const settings = await invoke('read_settings');

            if (settings) {
                setChromokey({ color: settings.color });
                setCamera({ counterCapturePhoto: settings.counter });
            }

        } catch (err) {
            console.log(err);
        }
    }

    // const loadingAppSettings = async () => {
    //     try {
    //         if (loading === false) {
    //             await invoke('update_selected_printer');
    //             setLoading(true);
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    
    const fetchProjects = async () => {
        try {
            const projectList = await invoke('get_projects');
            console.log(projectList);
            setProjects(projectList);
            
        } catch (err) {
            console.error(err);
            alert('Не удалось загрузить список проектов.');
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSave = async () => {
        if (selectedProject) {
            try {
                await invoke('select_project', { projectName: selectedProject.name });
                setProject({ isCurrent: false });
                toast.success("Сохранено успешно!");
                setActive(true);
                fetchTemplate()
                // await invoke('save_projects_and_create_dir', {projects});
                // await invoke('init_project_path');
            } catch (err) {
                console.error(err);
                alert("Не удалось сохранить проекты.");
            }
        } else {
            alert("Выберите проект перед сохранением.");
        }
        
        // const backgroundImageInBase64 = await invoke('get_image_path', { path: `database/settings/references_image` });
        // setReferences({ src: convertFileSrc(backgroundImageInBase64) });
        // console.log(reference.src);
    };
    


    const handlePrinterChange = (id) => {
        setProjects((prevProjects) => 
            prevProjects.map((project) => ({
                ...project,
                is_used: project.id === id, // Только у выбранного проекта is_used = true
            }))
        );
    
        const selected = projects.find((project) => project.id === id);
        console.log(selected);
        console.log(selectedProject);
        setSelectedProject(selected ? { ...selected, is_used: true } : null);
    };

    const addProject = () => {
        if (newProjectName.trim()) {
            const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
            setProjects([...projects, { id: newId, name: newProjectName.trim(), is_used: false }]);
            setNewProjectName("");
        }
    };

    const removeProject = async (id) => {
        setProjects(async (prevProjects) => {
            const updatedProjects = prevProjects.filter((project) => project.id !== id);
            prevProjects.forEach(async (project) => {
                if (project.id === id) {
                    await invoke('delete_project', { projectName: project.name });
                }
            })
    
            // Сбрасываем выбранный проект, если он был удален
            if (selectedProject?.id === id) {
                setSelectedProject(null);
            }


    
            return updatedProjects;
        });
    };

    const [listPH, setListPh] = useState([]);

    const handleListImage = async () => {
        const list = await invoke('get_image_paths')
        list.map(li => {
            setListPh(presfs => [...presfs, convertFileSrc(li)])

        })
        console.log(list);
    }
    
    return (
        <div className={`${active == true ? "pointer-events-none": "pointer-events-auto"} flex justify-center items-center`}>
            <div className="select-none relative  bg-cover bg-center bg-no-repeat" style={{width: '1280px', height: '1024px', backgroundImage: bgImage}}>
                <div className='back-img'></div>
                {project.isCurrent ? (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-2xl z-10">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col gap-14" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
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
                            <div className="create-project mt-4 py-2 border-b" >
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
                        </ul>       

                        <button onClick={handleSave} className="confirm-button mt-4 bg-green-500 text-white px-6 py-2 rounded-md">
                            Подтвердить
                        </button>
                    </div>
                </div>
                ) : (
                <div className='absolute top-0 left-0 w-full h-full flex justify-evenly items-center text-white text-2xl z-10'>
                    {/* <img src={image} alt="" /> */}
                    <div className="w-28"></div>
                    <div className="flex flex-col">
                        <NavLink to='/settings' className="absolute left-10 top-10 z-10 opacity-0 hover:opacity-100">
                            <Settings size={30} /> {/* Отображаем иконку шестеренки */}
                        </NavLink>
                        <NavLink to='/template'><img src={main_icon} alt="camera icon" /></NavLink>
                        <div style={word}><button onClick={() => navigate('/template')} >НАЧАТЬ ФОТОСЕССИЮ</button></div>
                        <canvas ref={canvasRefForSelect} style={{ width: '413.3px', height: '614.6px', display: 'none'}} />
                    </div>
                    <NavLink to="/list"><img className="w-28" src={printer} alt="" /></NavLink>
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