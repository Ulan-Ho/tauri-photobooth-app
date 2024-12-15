// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';

// export const useStore = create(devtools((set) => ({
//     canvases: [
//         {
//         id: 1,
//         canvasProps: {
//             backgroundColor: '#ffffff',
//             width: 1240,
//             height: 1844,
//         },
//         objects: [
//             {
//                 id: 1,
//                 left: 48,
//                 top: 48,
//                 fill: '#0000ff',
//                 width: 530,
//                 height: 490,
//                 angle: 0,
//                 stroke: '#000000',
//                 strokeWidth: 1,
//                 opacity: 1,
//                 scaleX: 1,
//                 scaleY: 1,
//                 flipX: false,
//                 flipY: false,
//                 shadow: {
//                     color: '#000000',
//                     blur: 5,
//                     offsetX: 5,
//                     offsetY: 5,
//                 },
//             },
//             {
//                 id: 2,
//                 left: 663,
//                 top: 48,
//                 fill: '#0000ff',
//                 width: 530,
//                 height: 490,
//                 angle: 0,
//                 stroke: '#000000',
//                 strokeWidth: 1,
//                 opacity: 1,
//                 scaleX: 1,
//                 scaleY: 1,
//                 flipX: false,
//                 flipY: false,
//                 shadow: {
//                     color: '#000000',
//                     blur: 5,
//                     offsetX: 5,
//                     offsetY: 5,
//                 },
//             },
//             {
//                 id: 3,
//                 left: 48,
//                 top: 585,
//                 fill: '#0000ff',
//                 width: 530,
//                 height: 490,
//                 angle: 0,
//                 stroke: '#000000',
//                 strokeWidth: 1,
//                 opacity: 1,
//                 scaleX: 1,
//                 scaleY: 1,
//                 flipX: false,
//                 flipY: false,
//                 shadow: {
//                     color: '#000000',
//                     blur: 5,
//                     offsetX: 5,
//                     offsetY: 5,
//                 },
//             },
//             {
//                 id: 4,
//                 left: 663,
//                 top: 585,
//                 fill: '#0000ff',
//                 width: 530,
//                 height: 490,
//                 angle: 0,
//                 stroke: '#000000',
//                 strokeWidth: 1,
//                 opacity: 1,
//                 scaleX: 1,
//                 scaleY: 1,
//                 flipX: false,
//                 flipY: false,
//                 shadow: {
//                     color: '#000000',
//                     blur: 5,
//                     offsetX: 5,
//                     offsetY: 5,
//                 },
//             },
//             {
//                 id: 5,
//                 left: 48,
//                 top: 1124,
//                 fill: '#0000ff',
//                 width: 530,
//                 height: 490,
//                 angle: 0,
//                 stroke: '#000000',
//                 strokeWidth: 1,
//                 opacity: 1,
//                 scaleX: 1,
//                 scaleY: 1,
//                 flipX: false,
//                 flipY: false,
//                 shadow: {
//                     color: '#000000',
//                     blur: 5,
//                     offsetX: 5,
//                     offsetY: 5,
//                 },
//             },
//             {
//                 id: 6,
//                 left: 663,
//                 top: 1124,
//                 fill: '#0000ff',
//                 width: 530,
//                 height: 490,
//                 angle: 0,
//                 stroke: '#000000',
//                 strokeWidth: 1,
//                 opacity: 1,
//                 scaleX: 1,
//                 scaleY: 1,
//                 flipX: false,
//                 flipY: false,
//                 shadow: {
//                     color: '#000000',
//                     blur: 5,
//                     offsetX: 5,
//                     offsetY: 5,
//                 },
//             }
//         ],
//         },
//     ],
//     currentCanvasId: 1,
//     switchCanvas: (canvasId) => set(() => ({
//         currentCanvasId: canvasId,
//     })),
//     setCanvasProps: (canvasId, key, value) => set((state) => ({
//         canvases: state.canvases.map((canvas) =>
//         canvas.id === canvasId
//             ? {
//                 ...canvas,
//                 canvasProps: {
//                 ...canvas.canvasProps,
//                 [key]: value,
//                 },
//             }
//             : canvas
//         ),
//     })),
//     addCanvas: () => set((state) => ({
//         canvases: [
//         ...state.canvases,
//         {
//             id: Date.now(),
//             canvasProps: {
//             backgroundColor: '#ffffff',
//             width: 1200,
//             height: 1800,
//             },
//             objects: [],
//         },
//         ],
//     })),
//     removeCanvas: (canvasId) => set((state) => ({
//         canvases: state.canvases.filter((canvas) => canvas.id !== canvasId),
//     })),
//     addObject: (canvasId, newObject) => set((state) => ({
//         canvases: state.canvases.map((canvas) =>
//         canvas.id === canvasId
//             ? {
//                 ...canvas,
//                 objects: [...canvas.objects, newObject],
//             }
//             : canvas
//         ),
//     })),
//     removeObject: (canvasId, objectId) => set((state) => ({
//         canvases: state.canvases.map((canvas) =>
//         canvas.id === canvasId
//             ? {
//                 ...canvas,
//                 objects: canvas.objects.filter((obj) => obj.id !== objectId),
//             }
//             : canvas
//         ),
//     })),
//     updateObjectProps: (canvasId, objectId, updatedProps) => set((state) => ({
//         canvases: state.canvases.map((canvas) =>
//         canvas.id === canvasId
//             ? {
//                 ...canvas,
//                 objects: canvas.objects.map((obj) =>
//                 obj.id === objectId ? { ...obj, ...updatedProps } : obj
//                 ),
//             }
//             : canvas
//         ),
//     })),
// })));


//-------------------------------------------------------------Главный код-------------------------------------------------------------
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';

// const limitPositionWithinCanvas = (obj, canvasWidth, canvasHeight) => {
//   obj.left = Math.max(0, Math.min(canvasWidth - obj.width, obj.left));
//   obj.top = Math.max(0, Math.min(canvasHeight - obj.height, obj.top));
//   return obj;
// };

// export const useStore = create(devtools((set) => ({
//   canvases: [
//     {
//       id: 1,
//       canvasProps: {
//         backgroundColor: '#ffffff',
//         width: 1240,
//         height: 1844,
//       },
//       objects: [
//         // {
//         //     id: 2,
//         //     type: "triangle",
//         //     left: 400,
//         //     top: 500,
//         //     width: 100,
//         //     height: 100,
//         //     fill: "#c58181",
//         //     stroke: "#000000",
//         //     strokeWidth: 0
//         // }
//         // {
//         //   id: 1,
//         //   type: 'rectangle', // Can be 'circle', 'star', 'polygon', 'line', 'image'
//         //   left: 48,
//         //   top: 48,
//         //   fill: '#0000ff',
//         //   width: 530,
//         //   height: 490,
//         //   angle: 0,
//         //   stroke: '#000000',
//         //   strokeWidth: 1,
//         //   opacity: 1,
//         //   scaleX: 1,
//         //   scaleY: 1,
//         //   flipX: false,
//         //   flipY: false,
//         //   shadow: {
//         //     color: '#000000',
//         //     blur: 5,
//         //     offsetX: 5,
//         //     offsetY: 5,
//         //   },
//         // },
//         // {
//         //   id: 2,
//         //   type: 'image', // Placeholder for photo
//         //   left: 200,
//         //   top: 200,
//         //   width: 400,
//         //   height: 400,
//         //   imageSrc: null, // This will be filled with image data from the gallery
//         // },
//       ],
//     },
//   ],
//   currentCanvasId: 1,

//   // Switch between different canvases
//   switchCanvas: (canvasId) => set(() => ({
//     currentCanvasId: canvasId,
//   })),

//   // Set canvas properties
//   setCanvasProps: (canvasId, key, value) => set((state) => ({
//     canvases: state.canvases.map((canvas) =>
//       canvas.id === canvasId
//         ? {
//             ...canvas,
//             canvasProps: {
//               ...canvas.canvasProps,
//               [key]: value,
//             },
//           }
//         : canvas
//     ),
//   })),

//   // Add new canvas
//   addCanvas: () => set((state) => ({
//     canvases: [
//       ...state.canvases,
//       {
//         id: Date.now(),
//         canvasProps: {
//           backgroundColor: '#ffffff',
//           width: 1200,
//           height: 1800,
//         },
//         objects: [],
//       },
//     ],
//   })),

//   // Remove canvas
//   removeCanvas: (canvasId) => set((state) => ({
//     canvases: state.canvases.filter((canvas) => canvas.id !== canvasId),
//   })),

//   // Add different types of shapes or images
//   addObject: (canvasId, newObject) => set((state) => ({
//     canvases: state.canvases.map((canvas) =>
//       canvas.id === canvasId
//         ? {
//             ...canvas,
//             objects: [...canvas.objects, newObject],
//           }
//         : canvas
//     ),
//   })),

//   // Remove objects (shapes, images)
//   removeObject: (canvasId, objectId) => set((state) => ({
//     canvases: state.canvases.map((canvas) =>
//       canvas.id === canvasId
//         ? {
//             ...canvas,
//             objects: canvas.objects.filter((obj) => obj.id !== objectId),
//           }
//         : canvas
//     ),
//   })),
//   updateObjectProps: (canvasId, objectId, newProps) => set((state) => {
//     return {
//         canvases: state.canvases.map((canvas) => {
//             if (canvas.id !== canvasId) {
//                 return canvas;
//             }

//             const updatedObjects = canvas.objects.map((obj) => {
//                 if (obj.id !== objectId) {
//                     return obj;
//                 }

//                 return { ...obj, ...newProps };
//             });

//             return { ...canvas, objects: updatedObjects };
//         }),
//     };
// }),





//   // Move images from gallery to canvas
//   addImageToCanvas: (canvasId, objectId, imageSrc) => set((state) => ({
//     canvases: state.canvases.map((canvas) =>
//       canvas.id === canvasId
//         ? {
//             ...canvas,
//             objects: canvas.objects.map((obj) =>
//               obj.id === objectId && obj.type === 'image'
//                 ? { ...obj, imageSrc }
//                 : obj
//             ),
//           }
//         : canvas
//     ),
//   })),
// })));
//-------------------------------------------------------------Новый код-------------------------------------------------------------
// import { create } from 'zustand';

// export const useStore = create((set) => ({
//   canvas: {
//     backgroundColor: '#ffffff',
//     width: 800,
//     height: 600,
//     objects: [],
//   },
//   setCanvasProps: (key, value) => set((state) => ({
//     canvas: {
//       ...state.canvas,
//       [key]: value,
//     }
//   })),
//   addObject: (newObject) => set((state) => ({
//     canvas: {
//       ...state.canvas,
//       objects: [...state.canvas.objects, new CanvasObject(newObject).render()],
//     }
//   })),
//   removeObject: (id) => set((state) => ({
//     canvas: {
//       ...state.canvas,
//       objects: state.canvas.objects.filter((obj) => obj.id !== id),
//     }
//   }))
// }));



// class CanvasObject {
//   constructor({ 
//     id, type, left, top, width, height, fill, stroke, strokeWidth, opacity = 1, 
//     rotation = 0, scaleX = 1, scaleY = 1, flipX = false, flipY = false, shadow = null 
//   }) {
//     this.id = id || Date.now();
//     this.type = type || 'rectangle';
//     this.left = left ?? 0;
//     this.top = top ?? 0;
//     this.width = width ?? 100;
//     this.height = height ?? 100;
//     this.fill = fill || '#000000';
//     this.stroke = stroke || '#000000';
//     this.strokeWidth = strokeWidth ?? 1;
//     this.opacity = opacity ?? 1;
//     this.rotation = rotation ?? 0;
//     this.scaleX = scaleX ?? 1;
//     this.scaleY = scaleY ?? 1;
//     this.flipX = flipX ?? false;
//     this.flipY = flipY ?? false;
//     this.shadow = shadow;
//   }

//   render() {
//     switch (this.type) {
//       case 'rectangle':
//         return { ...this };
//       case 'triangle':
//         return { ...this, points: '0,100 50,0 100,100' };
//       case 'circle':
//         return { ...this, rx: this.width / 2, ry: this.height / 2 };
//       case 'line':
//         return { ...this, x2: this.left + this.width, y2: this.top + this.height };
//       case 'polygon':
//         const points = [];
//         for (let i = 0; i < this.sides; i++) {
//           const angle = (i / this.sides) * 2 * Math.PI;
//           points.push([
//             this.left + this.width / 2 + (this.width / 2) * Math.cos(angle),
//             this.top + this.height / 2 + (this.height / 2) * Math.sin(angle),
//           ]);
//         }
//         return { ...this, points: points.flat().join(' ') };
//       default:
//         return { ...this };
//     }
//   }
// }


























import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const limitPositionWithinCanvas = (obj, canvasWidth, canvasHeight) => {
  obj.left = Math.max(0, Math.min(canvasWidth - obj.width, obj.left));
  obj.top = Math.max(0, Math.min(canvasHeight - obj.height, obj.top));
  return obj;
};
import back_img from '../assets/defaultImage.jpeg'; // Фоновое изображение

const getPlaceholderColor = (numberImage) => {
  switch (numberImage) {
    case 1:
      return '#FFD700'; // Золотистый
    case 2:
      return '#87CEEB'; // Голубой
    case 3:
      return '#90EE90'; // Светло-зелёный
    default:
      return '#D3D3D3'; // Серый по умолчанию
  }
};

const updateCanvasProperty = (canvasId, propertyUpdates) => set((state) => ({
  canvases: state.canvases.map((canvas) =>
      canvas.id === canvasId
          ? { ...canvas, ...propertyUpdates }
          : canvas
  ),
}));

export const useStore = create(devtools((set) => ({
  cameraStatus: false,

  isLiveView: false,

  updateCameraStatus: (status) => set((state) => ({ cameraStatus: status })),
  updateLiveViewStatus: (status) => set((state) => ({ isLiveView: status })),

  canvases: [
    {
      id: 1,
      canvasProps: {
        name: 'Canvas 1',
        available: true,
        backgroundColor: 'blue',
        width: 1240,
        height: 1844,
        webpData: null
      },
      objects: [
        {
          id: 1,
          nameObject: 'Placeholder 1',
          type: 'image',
          numberImage: 1,
          left: 48,
          top: 48,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 2,
          nameObject: 'Placeholder 2',
          type: 'image',
          numberImage: 1,
          left: 663,
          top: 48,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 3,
          nameObject: 'Placeholder 3',
          type: 'image',
          numberImage: 2,
          left: 48,
          top: 585,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 4,
          nameObject: 'Placeholder 4',
          type: 'image',
          numberImage: 2,
          left: 663,
          top: 585,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 5,
          nameObject: 'Placeholder 5',
          type: 'image',
          numberImage: 3,
          left: 48,
          top: 1124,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 6,
          nameObject: 'Placeholder 6',
          type: 'image',
          numberImage: 3,
          left: 663,
          top: 1124,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        }
      ],
    },
    {
      id: 2,
      canvasProps: {
        name: 'Canvas 2',
        available: true,
        backgroundColor: 'yellow',
        width: 1240,
        height: 1844,
      },
      objects: [
        {
          id: 1,
          nameobject: 'Placeholder 1',
          type: 'image',
          numberImage: 1,
          left: 48,
          top: 48,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 2,
          nameobject: 'Placeholder 2',
          type: 'image',
          numberImage: 1,
          left: 663,
          top: 48,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 3,
          nameobject: 'Placeholder 3',
          type: 'image',
          numberImage: 2,
          left: 48,
          top: 585,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 4,
          nameobject: 'Placeholder 4',
          type: 'image',
          numberImage: 2,
          left: 663,
          top: 585,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 5,
          nameobject: 'Placeholder 5',
          type: 'image',
          numberImage: 3,
          left: 48,
          top: 1124,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 6,
          nameobject: 'Placeholder 6',
          type: 'image',
          numberImage: 3,
          left: 663,
          top: 1124,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        }
      ],
    },
    {
      id: 3,
      canvasProps: {
        name: 'Canvas 3',
        available: true,
        backgroundColor: 'red',
        width: 1240,
        height: 1844,
      },
      objects: [
        {
          id: 1,
          nameobject: 'Placeholder 1',
          type: 'image',
          numberImage: 1,
          left: 48,
          top: 48,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 2,
          nameobject: 'Placeholder 2',
          type: 'image',
          numberImage: 1,
          left: 663,
          top: 48,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 3,
          nameobject: 'Placeholder 3',
          type: 'image',
          numberImage: 2,
          left: 48,
          top: 585,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 4,
          nameobject: 'Placeholder 4',
          type: 'image',
          numberImage: 2,
          left: 663,
          top: 585,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 5,
          nameobject: 'Placeholder 5',
          type: 'image',
          numberImage: 3,
          left: 48,
          top: 1124,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        {
          id: 6,
          nameobject: 'Placeholder 6',
          type: 'image',
          numberImage: 3,
          left: 663,
          top: 1124,
          width: 530,
          height: 490,
          // fill: '', // Прозрачный фон для фото-заглушки
          src: '', // Здесь будет ссылка на фото, которая появится после съемки
          zIndex: 3,
          stroke: '#000000',
          strokeWidth: 0,
          rotate: 0,
          opacity: 1,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        }
      ],
    },
  ],

  updateStatus: false,

  chromokeyStatus: false,

  chromokeyBackgroundImage: {
    // id: 9999999,
    // type: 'image',
    // numberImage: 1,
    // left: 48,
    // top: 48,
    // width: 530,
    // height: 490,
    imgObject: '',
    src: back_img,
  },

  chromokeyColor: '#00ff00',

  setChromokeyStatus: (status) => set({ chromokeyStatus: status }),

  setChromokeyBackgroundImage: (imageObject, imageSrc) => set({
    chromokeyBackgroundImage: {
      imgObject: imageObject,
      src: imageSrc,
    },
  }),

  setChromokeyColor: (color) => set({ chromokeyColor: color }),

  setUpdateStatus: (value) => set({ updateStatus: value }),

  error: null,  // Новое состояние для ошибок

  setError: (message) => set({ error: message }),  // Функция для обновления ошибки

  currentCanvasId: 1,

  // Switch between different canvases
  switchCanvas: (canvasId) => set(() => ({
    currentCanvasId: canvasId,
  })),

  setCanvasProps: (canvasId, propertyUpdates) => set((state) => ({
    canvases: state.canvases.map((canvas) =>
      canvas.id === canvasId
        ? {
            ...canvas,
            canvasProps: {
              ...canvas.canvasProps,
              ...propertyUpdates
            }
          }
        : canvas
    ),
  })),

  setCanvasData: (newCanvases) => set({ canvases: newCanvases }),

  // Add new canvas
  addCanvas: () => set((state) => ({
    canvases: [
      ...state.canvases,
      {
        id: Date.now(),
        canvasProps: {
          name: 'New Canvas',
          available: false,
          backgroundColor: '#ffffff',
          width: 1240,
          height: 1844,
        },
        objects: [
          {
            id: 1,
            nameObject: 'Placeholder 1',
            type: 'image',
            numberImage: 1,
            left: 48,
            top: 48,
            width: 530,
            height: 490,
            // fill: '', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          {
            id: 2,
            nameObject: 'Placeholder 2',
            type: 'image',
            numberImage: 1,
            left: 663,
            top: 48,
            width: 530,
            height: 490,
            // fill: '', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          {
            id: 3,
            nameObject: 'Placeholder 3',
            type: 'image',
            numberImage: 2,
            left: 48,
            top: 585,
            width: 530,
            height: 490,
            // fill: '', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          {
            id: 4,
            nameObject: 'Placeholder 4',
            type: 'image',
            numberImage: 2,
            left: 663,
            top: 585,
            width: 530,
            height: 490,
            // fill: '', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          {
            id: 5,
            nameObject: 'Placeholder 5',
            type: 'image',
            numberImage: 3,
            left: 48,
            top: 1124,
            width: 530,
            height: 490,
            // fill: '', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
          {
            id: 6,
            nameObject: 'Placeholder 6',
            type: 'image',
            numberImage: 3,
            left: 663,
            top: 1124,
            width: 530,
            height: 490,
            // fill: '', // Прозрачный фон для фото-заглушки
            src: '', // Здесь будет ссылка на фото, которая появится после съемки
            zIndex: 1,
            stroke: '#000000',
            strokeWidth: 1,
            rotate: 0,
            opacity: 1,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          }
        ],
      },
    ],
  })),

  // Remove canvas
  removeCanvas: (canvasId) => set((state) => ({
    canvases: state.canvases.filter(canvas => canvas.id !== canvasId),
    // Убедись, что currentCanvasId обновляется, если удален текущий холст
    currentCanvasId: state.currentCanvasId === canvasId ? state.canvases[0]?.id : state.currentCanvasId,
  })),


  // Add different types of shapes or images
  addObject: (canvasId, newObject) => set((state) => ({
    canvases: state.canvases.map((canvas) =>
      canvas.id === canvasId
        ? {
            ...canvas,
            objects: [...canvas.objects, newObject],
          }
        : canvas
    ),
  })),

  // Remove objects (shapes, images)
  removeObject: (canvasId, objectId) => set((state) => ({
    canvases: state.canvases.map((canvas) =>
      canvas.id === canvasId
        ? {
            ...canvas,
            objects: canvas.objects.filter((obj) => obj.id !== objectId),
          }
        : canvas
    ),
  })),

  // Update object properties
  updateObjectProps: (canvasId, objectId, newProps) => set((state) => {
    return {
      canvases: state.canvases.map((canvas) => {
        if (canvas.id !== canvasId) {
          return canvas;
        }

        const updatedObjects = canvas.objects.map((obj) => {
          if (obj.id !== objectId) {
            return obj;
          }

          return { ...obj, ...newProps };
        });

        return { ...canvas, objects: updatedObjects };
      }),
    };
  }),

  // Move images from gallery to canvas
  addImageToCanvas: (canvasId, imageSrc) => set((state) => ({
    canvases: state.canvases.map((canvas) =>
        canvas.id === canvasId
            ? {
                ...canvas,
                objects: [
                    ...canvas.objects,
                    {
                        id: Date.now(), // Уникальный ID для нового объекта
                        nameObject: 'Image', // Название объекта
                        type: 'image',
                        imageSrc: imageSrc,
                        x: 0, // Начальные координаты по X
                        y: 0, // Начальные координаты по Y
                        width: 100, // Ширина изображения
                        height: 100, // Высота изображения
                        rotate: 0, // Угол поворота
                        opacity: 1, // Прозрачность
                    },
                ],
            }
            : canvas
    ),
})),

  // Resize canvas dimensions
  resizeCanvas: (canvasId, width, height) => set((state) => ({
    canvases: state.canvases.map((canvas) =>
      canvas.id === canvasId
        ? {
            ...canvas,
            canvasProps: {
              ...canvas.canvasProps,
              width: Math.max(100, width), // Minimum width
              height: Math.max(100, height), // Minimum height
            },
          }
        : canvas
    ),
  })),

  // Set aspect ratio
  setAspectRatio: (canvasId, ratio) => set((state) => {
    let newWidth, newHeight;

    switch (ratio) {
      case '1:1':
        newWidth = state.canvases.find(c => c.id === canvasId).canvasProps.height;
        newHeight = newWidth; // Square
        break;
      case '4:6':
        newHeight = state.canvases.find(c => c.id === canvasId).canvasProps.width * 0.75;
        newWidth = state.canvases.find(c => c.id === canvasId).canvasProps.width; // 4:6 ratio
        break;
      default:
        return;
    }

    return {
      canvases: state.canvases.map((canvas) =>
        canvas.id === canvasId
          ? {
              ...canvas,
              canvasProps: {
                ...canvas.canvasProps,
                width: newWidth,
                height: newHeight,
              },
            }
          : canvas
      ),
    };
  }),

})));
