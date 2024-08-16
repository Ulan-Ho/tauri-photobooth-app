import React, { useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layouts from '../components/Layout1.jsx';
import SvgDisplay from './SvgDisplay.jsx';

export default function PrintPage({ images }) {
  const svgRef = useRef(null);

  const handlePrint = async () => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const base64Data = btoa(svgData);

        try {
          toast.info("Начало печати...");
          console.log("Отправка данных на сервер для печати...");
          await invoke("print_image", {
            imageData: base64Data,
            format: "svg",
            printerName: "HiTi P525"
          });
          toast.success("Печать успешно начата");
          console.log("Печать успешно начата");
        } catch (error) {
          toast.error("Ошибка при печати");
          console.error("Ошибка при печати:", error);
        }
      } else {
        toast.error("SVG элемент не найден");
        console.error("SVG элемент не найден");
      }
    } else {
      toast.error("SVG ref не найден");
      console.error("SVG ref не найден");
    }
  };

  return (
    <Layouts>
      <div className="flex items-center">
        <div className="flex flex-col justify-center items-center">
          <h2>Template your Photo</h2>
          <div className="flex flex-col items-center">
            <div className="p-3 mb-5 border-black border-solid">
              <SvgDisplay ref={svgRef} />
            </div>
          </div>
        </div>
        <button onClick={handlePrint}>Print</button>
      </div>
      <ToastContainer />
    </Layouts>
  );
}