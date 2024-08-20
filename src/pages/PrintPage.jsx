import React, { useRef, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layouts from '../components/Layout1.jsx';
import bg_screen from "../components/images_for_template/Макет.png";
import templateTriangle from '../assets/templateTriangle.png';
import { useNavigate  } from 'react-router-dom';
import lev from "../components/images_for_template/левое.png";
import pre from "../components/images_for_template/правое.png";
import left_word from "../components/images_for_template/word_left.png";
import right_word from "../components/images_for_template/word_right.png";

export default function PrintPage({ images, design, template }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [isImage, setIsImage] = useState();

  const drawImage = (ctx, src, x, y) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      ctx.drawImage(img, x, y);
    };
  };

  const drawTransformedImage = (ctx, src, matrix) => {
    const img = new Image();
    img.src = src;
  
    img.onload = () => {
      const [a, b, c, d, e, f] = matrix;
      ctx.setTransform(a, b, c, d, e, f); // Применение матрицы трансформации
      ctx.drawImage(img, 0, 0, 93.47, 89.62); // Отрисовка изображения
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Сброс трансформации
    };
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && images.length > 0) {
      const ctx = canvas.getContext('2d');
      const bg = new Image();
      bg.src = bg_screen; // Убедитесь, что bg_screen определен
      bg.onload = () => {
        // Отрисовка фона
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        // Отрисовка изображений
        if ( design == 'grayscale' ) {
          ctx.filter = 'grayscale(100%)';
        }
        

        let loadedImages = 0;


        images.forEach((image, index) => {
          const img = new Image();
          img.src = image.url;
          img.onload = () => {
            const positions_1 = [
              { x1: 48, x2: 662, y1: 48, width: 530, height: 489 },
              { x1: 48, x2: 662, y1: 585, width: 530, height: 489 },
              { x1: 48, x2: 662, y1: 1124, width: 530, height: 489 },
            ];

            const { x1, x2, y1, width, height } = positions_1[index];
            ctx.drawImage(img, x1, y1, width, height);
            ctx.drawImage(img, x2, y1, width, height);

            loadedImages++;
          if (loadedImages === images.length) {
            finalizeCanvas(ctx, canvas);
          }
          };
        });
        ctx.filter = 'none';

        drawImage(ctx, left_word, 70, 1520);
        finalizeCanvas(ctx, canvas);
        drawImage(ctx, right_word, 1035, 1520);
        finalizeCanvas(ctx, canvas);
        drawTransformedImage(ctx, lev, [0.684197, -0.193013, -0.193013, -0.684197, 78.5329, 1517.83]);
        finalizeCanvas(ctx, canvas);
        drawTransformedImage(ctx, pre, [-0.684197, -0.193013, 0.193013, -0.684197, 1158.32, 1517.83]);
        finalizeCanvas(ctx, canvas);

        if(template === 2) {
          
        }
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setIsImage(url);
          }
        }, 'image/png');
      };
      
    }
  }, [images, design, template]);


  const finalizeCanvas = (ctx, canvas) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setIsImage(url);
      }
    }, 'image/png');
  };

  // const showImage = () => {
  //   canvas.toBlob((blob) => {
  //     if (blob) {
  //       const url = URL.createObjectURL(blob);
  //       setIsImage(url);
  //     }
  //   }, 'image/png');
  // }
  return (
    <Layouts>
      <div className="flex items-center">
        <div className="flex flex-col justify-center items-center">
          <h2>Template your Photo</h2>
          <div className="flex flex-col items-center">
            <div className="p-3 mb-5 border-black border-solid">
              <canvas
                ref={canvasRef}
                width="1240"
                height="1844"
                style={{ width: '400px', height: '600px' }}
              >
              </canvas>
              {isImage && <img style={{width: '400px', height: '600px'}} src={isImage} alt="Generated Preview" />}
              <div>{design}</div>
              {/* <button onClick={showImage}>Покажи фото</button> */}
            </div>
          </div>
        </div>
        {/* <button onClick={handlePrint}>Print</button> */}
        <div className='left-10 bottom-10 absolute'>
                        <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white' onClick={() => navigate('/')}>
                            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
                        </button>
                    </div>
      </div>
    </Layouts>
  );
}