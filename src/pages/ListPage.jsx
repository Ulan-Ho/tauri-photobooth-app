import { useEffect, useState } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { NavLink } from "react-router-dom";
import printer from '../assets/printer.png'

export default function ListPage() {

    const [listPhotos, setListPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    async function fetchData() {
        const list = await invoke('get_image_paths')
        // setListPhotos([]);
        setListPhotos(list);
        console.log(list);
    }

    useEffect(() => {
        fetchData()
    }, [])

    function selectPhoto(photo) {
        console.log(photo);
        setSelectedPhoto(photo);
    }

    async function printPhoto() {
        if (selectedPhoto) {
            await invoke('print_image_use_path', { imagePath: selectedPhoto })
        }
    }

    return (
        <div className="flex justify-center items-center ">
            <div className="select-none relative  bg-cover bg-center bg-no-repeat" style={{width: '1280px', height: '1024px'}}>
                <div className="flex justify-around items-center w-full py-5 px-10">
                    <NavLink to="/" className="px-2 py-1 bg-blue-600 text-white rounded-md">Назад</NavLink>
                    <h1 className="text-xl font-bold">Список фотографий</h1>
                    <button onClick={fetchData} className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white hover:text-gray-800 rounded-md ">Обновить</button>
                </div>
                <div className="flex w-full justify-center items-center h-full">
                    <div className="flex flex-col gap-4 w-4/5 overflow-y-auto h-full">
                        <ul className="flex flex-wrap gap-4 justify-center items-center">
                            {listPhotos.map((photo) => (
                                <li key={photo} ><button className={`border-4 ${selectedPhoto === photo ? "border-blue-500" : "border-transparent"} rounded-lg`} onClick={() => {selectPhoto(photo)}}><img className="h-[500px] w-[300px] rounded-sm" src={convertFileSrc(photo)}/></button></li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4 w-1/5 justify-center items-center">
                        <button className="flex flex-col gap-4 w-40 h-40 bg-white rounded-lg justify-center items-center" onClick={() => {printPhoto()}}>
                            <img src={printer} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}