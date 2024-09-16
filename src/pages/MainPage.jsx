import { NavLink, resolvePath, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import '../App.css';
import main_icon from '../assets/main_icon.png';
import back_img from '../assets/firstMainBg.jpeg';
import { invoke } from '@tauri-apps/api/tauri';
import { toast,ToastContainer } from "react-toastify";
import * as path from '@tauri-apps/api/path';
import { listen } from '@tauri-apps/api/event';
import { usePageNavigation } from "../App";

export default function MainPage() {
    usePageNavigation();
    // (async () => {
    //     try {
    //         let imageName = '1_bg.jpeg';
    //         const base64Image = await invoke('get_image', { imageName });
    //         const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    //         setBackgroundImage(imageUrl);
    //     } catch (error) {
    //         console.error('Error fetching image:', error);
    //     }
    // })();
    // useEffect(() => {
    //     async function fetchImage(imageName) {
    //         try {
    //             const base64Image = await invoke('get_image', { imageName });
    //             const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    //             setBackgroundImage(imageUrl);
    //             toast(imageUrl);
    //         } catch (error) {
    //             console.error('Error fetching image:', error);
    //         }
    //     }

    //     if (backgroundImage === null) {
    //         fetchImage('1_bg.jpeg');
    //     }
    // }, []);

    
    return (
        <div className="flex justify-center items-center scale-0.5">
            <div className="select-none relative  bg-cover bg-center bg-no-repeat" style={{width: '1280px', height: '1024px', backgroundImage: `url(src/assets/firstMainBg.jpeg)`}}>
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