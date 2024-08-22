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
import rulSrc from "../components/images_for_template/rule.png";
import printer from "../assets/printer.png";


export default function PrintPage({ images, design, template }) {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [isImage, setIsImage] = useState(null);


  const drawImage = (ctx, src, x, y) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (design === 'grayscale') {
        ctx.filter = 'grayscale(100%)';
      }
      ctx.drawImage(img, x, y);
      ctx.filter = 'none';
    };
  };

  const drawTransformedImage = (ctx, src, matrix) => {
    const img = new Image();
    img.src = src;
  
    img.onload = () => {
      const [a, b, c, d, e, f] = matrix;
      if (design === 'grayscale') {
        ctx.filter = 'grayscale(100%)';
      }
      ctx.setTransform(a, b, c, d, e, f); // Применение матрицы трансформации
      ctx.drawImage(img, 0, 0, 93.47, 89.62); // Отрисовка изображения
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Сброс трансформации
      ctx.filter = 'none';
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && images.length > 0) {
      const ctx = canvas.getContext('2d');
      const bg = new Image();
      bg.src = bg_screen;
      bg.onload = () => {
        if (design === 'grayscale') {
          ctx.filter = 'grayscale(100%)';
        }
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        let loadedImages = 0;
        images.forEach((image, index) => {
          const img = new Image();
          img.src = image.url;
          img.onload = () => {
            const positions_1 = [
              { x1: 48, x2: 662, y1: 48, width: 530, height: 490 },
              { x1: 48, x2: 662, y1: 585, width: 530, height: 490 },
              { x1: 48, x2: 662, y1: 1124, width: 530, height: 490 },
            ];

            const { x1, x2, y1, width, height } = positions_1[index];

            if (design === 'grayscale') {
              ctx.filter = 'grayscale(100%)';
            }

            ctx.drawImage(img, x1, y1, width, height);
            ctx.drawImage(img, x2, y1, width, height);

            ctx.filter = 'none';

            loadedImages++;
            if (loadedImages === images.length) {
              finalizeCanvas(canvas);
            }
          };
        });

        drawImage(ctx, left_word, 70, 1520);
        drawImage(ctx, right_word, 1035, 1520);
        drawTransformedImage(ctx, lev, [0.684197, -0.193013, -0.193013, -0.684197, 78.5329, 1517.83]);
        drawTransformedImage(ctx, pre, [-0.684197, -0.193013, 0.193013, -0.684197, 1158.32, 1517.83]);

        if (template === 2) {
          const rul = new Image();
          rul.src = rulSrc;
          rul.onload = () => {
            const rulePosition = [
              { x: 176.18, y1: 405.05, y2: 942.28, y3: 1480 },
              { x: 790, y1: 405.05, y2: 942.28, y3: 1480 }
            ];
            if (design === 'grayscale') {
              ctx.filter = 'grayscale(100%)';
            }
            for(let position of rulePosition) {
              ctx.drawImage(rul, position.x, position.y1, 266.25, 132.75);
              ctx.drawImage(rul, position.x, position.y2, 266.25, 132.75);
              ctx.drawImage(rul, position.x, position.y3, 266.25, 132.75);
            }
            ctx.filter = 'none';
          }
        }
        const imageData = canvas.toDataURL('image/png');
        setIsImage(imageData);
      };
    }
  }, [images, design, template]);

  const handlePrint = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      // setIsImage(imageData);
      toast('Printing...', { type: 'info' });
      invoke('print_image', { imageData: imageData })
        .then(() => {
          toast('Printing started', { type: 'success' });
          console.log('Printing started');
        })
        .catch((error) => {
          toast('Error printing', { type: 'error' });
          console.error('Error printing:', error);
        });
    } else {
      toast('No image available for printing', { type: 'warning' });
    }
    navigate('/')
  };

  return (
    <Layouts>
      <div className="w-full flex flex-col gap-9 justify-center items-center px-20">
        <div className='flex flex-col gap-3'>
          <button className='h-9 flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' style={{ visibility: 'hidden' }}>
            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
          </button>
          <div className='flex justify-end items-center'>
            <div className='w-32'></div>
            <div className='relative items-center box_print'>
              <div className='bg_print' ></div>
              <div>
                <div  className='absolute bottom-1 left-0 w-full h-full flex gap-10 justify-center items-center z-10'>
                  <canvas
                    ref={canvasRef}
                    width="1240"
                    height="1844"
                    style={{ width: '300px', height: '450px' }}
                  ></canvas>
                </div>
              </div>
            </div>
            <button className='h-9 flex justify-center items-center' onClick={handlePrint}><img src={printer} alt="" /></button>
          </div>
        </div>
        <div>{design}</div>
        <div className=' flex justify-start items-center w-full'>
          <button className='flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg border-white bg-red-700' onClick={() => navigate('/capture')}>
            <img className='w-5 transform -scale-x-100' src={templateTriangle} alt="Back" /> НАЗАД
          </button>
        </div>
      </div>
      <ToastContainer/>
    </Layouts>
  );
}
