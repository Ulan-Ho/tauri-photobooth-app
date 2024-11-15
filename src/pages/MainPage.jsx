import { NavLink, resolvePath, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import '../App.css';
import main_icon from '../assets/main_icon.png';
import back_img from '../assets/defaultImage.jpeg';
import { toast,ToastContainer } from "react-toastify";
import { usePageNavigation } from "../App";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";

export default function MainPage() {
    const [bgImage, setBgImage] = useState(localStorage.getItem("back_1") || `url(${back_img})`);
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
        if(!localStorage.getItem("back_1")) {
            fetchImage();
        } else {
            setBgImage(localStorage.getItem("back_1"))
        }
    },[]);

    return (
        <div className="flex justify-center items-center">
            <div className="select-none relative  bg-cover bg-center bg-no-repeat" style={{width: '1280px', height: '1024px', backgroundImage: bgImage}}>
                <div className='back-img'></div>
                <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center text-white text-2xl z-10'>
                    <div className="flex flex-col">
                        <NavLink to='/template'><img src={main_icon} alt="camera icon" /></NavLink>
                        <div style={word}>НАЧАТЬ ФОТОСЕССИЮ </div>
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