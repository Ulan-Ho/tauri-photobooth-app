// Функция для рисования прямоугольника
export const drawRectangle = (ctx, obj) => {
    setShadow(ctx, obj);
    ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
    offShadow(ctx);
    // Рисуем обводку
    setStroke(ctx, obj);
    if (obj.strokeWidth != 0) ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
}
// Функция для рисования круга
export const drawCircle = (ctx, obj) => {
    const rotateInRadians = obj.rotate * (Math.PI / 180);
    ctx.beginPath();
    ctx.ellipse(0, 0, obj.width / 2, obj.height / 2, rotateInRadians, 0, Math.PI * 2);
    setShadow(ctx, obj);
    ctx.fill();
    offShadow(ctx);
    if (obj.strokeWidth) setStroke(ctx, obj);
    ctx.closePath();
}
// Функция для рисования звезды
export const drawStar = (ctx, obj) => {
    let rot = Math.PI / 2 * 3;
    let x = 0;
    let y = 0;
    const step = Math.PI / ( obj.spikes || 5 ) ;

    ctx.beginPath();
    ctx.moveTo(0, -obj.width / 2);
    for (let i = 0; i < obj.spikes; i++) {
        x = Math.cos(rot) * obj.width / 2;
        y = Math.sin(rot) * obj.width / 2;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * obj.height / 4;
        y = Math.sin(rot) * obj.height / 4;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.closePath();
    setShadow(ctx, obj);
    ctx.fill();
    offShadow(ctx);
    if (obj.strokeWidth) setStroke(ctx, obj);
};
// Функция для рисования многоугольника
export const drawPolygon = (ctx, obj) => {
    const angle = (Math.PI * 2) / obj.sides;
    ctx.beginPath();
    for (let i = 0; i < obj.sides; i++) {
        const x = Math.cos(i * angle) * obj.width / 2;
        const y = Math.sin(i * angle) * obj.height / 2;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    setShadow(ctx, obj);
    ctx.fill();
    offShadow(ctx);
    if (obj.strokeWidth) setStroke(ctx, obj);
};
// Функция для рисования треугольника
export const drawTriangle = (ctx, obj) => {
    const height = (Math.sqrt(3) / 2) * obj.height;
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(-obj.width / 2, height / 2);
    ctx.lineTo(obj.width / 2, height / 2);
    ctx.closePath();
    setShadow(ctx, obj);
    ctx.fill();
    offShadow(ctx);
    if (obj.strokeWidth) setStroke(ctx, obj);
};
// Функция для рисования линии
export const drawLine = (ctx, obj) => {
    ctx.beginPath();
    ctx.moveTo(-obj.width / 2, 0);
    ctx.lineTo(obj.width / 2, 0);
    setShadow(ctx, obj);
    ctx.fill();
    offShadow(ctx);
    if (obj.strokeWidth) setStroke(ctx, obj);
};
// Функция для рисования изображения
export const drawCromakeyBackgroundImage = (ctx, obj, chromokeyBackgroundImage, drawImage) => {
    if (!chromokeyBackgroundImage || !chromokeyBackgroundImage.imgObject) {
        chromokeyBackgroundImage.imgObject = new Image();
        chromokeyBackgroundImage.imgObject.crossOrigin = "anonymous";
        chromokeyBackgroundImage.imgObject.src = chromokeyBackgroundImage.src;
    }

    if (drawImage) {
        const draw = () => {
            const imgAspectRatio = chromokeyBackgroundImage.imgObject.width / chromokeyBackgroundImage.imgObject.height;
            const objectAspectRatio = obj.width / obj.height;
            let drawWidth, drawHeight, offsetX, offsetY;
            // Рассчитываем размеры и смещение для "object-cover"
            if (imgAspectRatio > objectAspectRatio) {
                // Изображение шире объекта
                drawWidth = obj.height * imgAspectRatio;
                drawHeight = obj.height;
                offsetX = -(drawWidth - obj.width) / 2;
                offsetY = 0;
            } else {
                // Изображение выше объекта
                drawWidth = obj.width;
                drawHeight = obj.width / imgAspectRatio;
                offsetX = 0;
                offsetY = -(drawHeight - obj.height) / 2;
            }
            // Рисуем изображение с обрезкой
            ctx.save(); // Сохраняем текущий контекст
            ctx.translate(obj.x, obj.y); // Перемещаемся в позицию объекта
            ctx.beginPath();
            // ctx.rect(-obj.width / 2, -obj.height / 2, obj.width, obj.height); // Ограничиваем область
            // ctx.clip(); // Применяем обрезку
            ctx.drawImage(
                chromokeyBackgroundImage.imgObject,
                offsetX,
                offsetY,
                drawWidth,
                drawHeight
            );
            ctx.restore();
        }
        if (!chromokeyBackgroundImage.imgObject.complete) {
            chromokeyBackgroundImage.imgObject.crossOrigin = "anonymous";
            chromokeyBackgroundImage.imgObject.onload = draw;
        } else {
            draw();
        }
    } 
    if (!drawImage) {
        const draw = () => {
            const imgAspectRatio = chromokeyBackgroundImage.imgObject.width / chromokeyBackgroundImage.imgObject.height;
            const objectAspectRatio = obj.width / obj.height;
            let drawWidth, drawHeight, offsetX, offsetY;
            // Рассчитываем размеры и смещение для "object-cover"
            if (imgAspectRatio > objectAspectRatio) {
                // Изображение шире объекта
                drawWidth = obj.height * imgAspectRatio;
                drawHeight = obj.height;
                offsetX = -(drawWidth - obj.width) / 2;
                offsetY = 0;
            } else {
                // Изображение выше объекта
                drawWidth = obj.width;
                drawHeight = obj.width / imgAspectRatio;
                offsetX = 0;
                offsetY = -(drawHeight - obj.height) / 2;
            }
            // Рисуем изображение с обрезкой
            ctx.save(); // Сохраняем текущий контекст
            ctx.translate(obj.x, obj.y); // Перемещаемся в позицию объекта
            ctx.beginPath();
            ctx.rect(-obj.width / 2, -obj.height / 2, obj.width, obj.height); // Ограничиваем область
            ctx.clip(); // Применяем обрезку
            ctx.drawImage(
                chromokeyBackgroundImage.imgObject,
                offsetX - obj.width / 2,
                offsetY - obj.height / 2,
                drawWidth,
                drawHeight
            );
            ctx.restore();
        }
        if (!chromokeyBackgroundImage.imgObject.complete) {
            chromokeyBackgroundImage.imgObject.crossOrigin = "anonymous";
            chromokeyBackgroundImage.imgObject.onload = draw;
        } else {
            draw();
        }
    };

};



// Функция для рисования изображения в режиме выбора
export const drawImages = (ctx, obj, bool, chromokeyBackgroundImage, backImage) => {
    if (!obj.imgObject) {
        // Создаем и сохраняем объект изображения, если он еще не создан
        obj.imgObject = new Image();
        obj.imgObject.crossOrigin = "anonymous";
        obj.imgObject.src = obj.src;
    }

    // Отрисовка изображения после загрузки
    if (bool === true) {
        obj.imgObject.onload = () => {
            setShadow(ctx, obj);
            ctx.drawImage(obj.imgObject, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            offShadow(ctx);
            if (obj.strokeWidth) setStroke(ctx, obj);
        };

        if (obj.imgObject.complete) {
            setShadow(ctx, obj);
            if (obj.numberImage === 1) drawSquare(ctx, obj, 'red', 1);
            if (obj.numberImage === 2) drawSquare(ctx, obj, 'blue', 2);
            if (obj.numberImage === 3) drawSquare(ctx, obj, 'green', 3);
            ctx.drawImage(obj.imgObject, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            offShadow(ctx);
            if (obj.strokeWidth) setStroke(ctx, obj);
        }
    }
    if (bool === false) {
        if (obj.numberImage === 1 || obj.numberImage === 2 || obj.numberImage === 3) {
            obj.imgObject.onload = () => {
                drawCromakeyBackgroundImage(ctx, obj, chromokeyBackgroundImage, backImage);
                // Пропорции изображения и объекта
                const imgAspectRatio = obj.imgObject.width / obj.imgObject.height;
                const objectAspectRatio = obj.width / obj.height;
                let drawWidth, drawHeight, offsetX, offsetY;
                // Рассчитываем размеры и смещение для "object-cover"
                if (imgAspectRatio > objectAspectRatio) {
                    // Изображение шире объекта
                    drawWidth = obj.height * imgAspectRatio;
                    drawHeight = obj.height;
                    offsetX = -(drawWidth - obj.width) / 2;
                    offsetY = 0;
                } else {
                    // Изображение выше объекта
                    drawWidth = obj.width;
                    drawHeight = obj.width / imgAspectRatio;
                    offsetX = 0;
                    offsetY = -(drawHeight - obj.height) / 2;
                }
                // Рисуем изображение с обрезкой
                ctx.save(); // Сохраняем текущий контекст
                ctx.translate(obj.x, obj.y); // Перемещаемся в позицию объекта
                ctx.beginPath();
                ctx.rect(-obj.width / 2, -obj.height / 2, obj.width, obj.height); // Ограничиваем область
                ctx.clip(); // Применяем обрезку
                ctx.drawImage(
                    obj.imgObject,
                    offsetX - obj.width / 2,
                    offsetY - obj.height / 2,
                    drawWidth,
                    drawHeight
                );
                ctx.restore(); // Восстанавливаем контекст
            };
        } else {
            obj.imgObject.onload = () => {
                setShadow(ctx, obj);
                ctx.drawImage(obj.imgObject, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
                offShadow(ctx);
                if (obj.strokeWidth) setStroke(ctx, obj);
            };
        }

        if (obj.imgObject.complete) {
            obj.imgObject.onload();
        }
    }

    // Проверка, если изображение уже загружено, то сразу рисуем
};
// Функция для рисования квадрата с номером изображения
export const drawSquare = (ctx, obj, fill, numberImage) => {
    ctx.beginPath();
    ctx.rect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);  // Например, квадрат размером 100x100
    ctx.fillStyle = fill;  // Полупрозрачный красный цвет
    ctx.fill();

    ctx.font = '160px Arial';  // Размер и шрифт текста
    ctx.textAlign = 'center';  // Выравнивание текста по центру
    ctx.textBaseline = 'middle';  // Вертикальное выравнивание по центру

    // Координаты для отображения текста в центре квадрата
    ctx.fillStyle = 'white';  // Цвет текста
    ctx.fillText(numberImage, 0, 0);
};

export const offShadow = (ctx) => {
    // Отключаем тень перед рисованием обводки
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';  // Прозрачная тень
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}
export const setShadow = (ctx, obj) => {
    // Настройки тени
    ctx.shadowColor = obj.shadowColor || 'rgba(0, 0, 0, 0)'; // Если не задано, устанавливается прозрачная тень
    ctx.shadowBlur = obj.shadowBlur || 0;                    // Если не задано, размытие тени равно 0
    ctx.shadowOffsetX = obj.shadowOffsetX || 0;              // Если не задано, смещение тени по X равно 0
    ctx.shadowOffsetY = obj.shadowOffsetY || 0;              // Если не задано, смещение тени по Y равно 0
};
export const setStroke = (ctx, obj) => {
    ctx.strokeStyle = obj.stroke || '#000';           // Цвет обводки по умолчанию — черный
    ctx.lineWidth = obj.strokeWidth;             // Ширина линии по умолчанию — 1
    if (obj.type === 'image') ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
    else ctx.stroke();
}
export const setRotate = (ctx, obj) => {
    const centerX = obj.left + obj.width / 2;
    const centerY = obj.top + obj.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((obj.rotate || 0) * Math.PI / 180);
}

function drawDashedCenterLines(ctx, canvasWidth, canvasHeight, object) {
    // Центр объекта
    const objectCenterX = object.x + object.width / 2;
    const objectCenterY = object.y + object.height / 2;

    // Настройки для линий
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Полупрозрачный черный цвет
    ctx.lineWidth = 5; // Толщина линии
    ctx.setLineDash([50, 10]); // Пунктир: 5px линия, 5px пробел

    // Рисуем вертикальную линию через центр объекта
    ctx.beginPath();
    ctx.moveTo(objectCenterX, 0); // Начало линии сверху
    ctx.lineTo(objectCenterX, canvasHeight); // Линия вниз до края холста
    ctx.stroke();

    // Рисуем горизонтальную линию через центр объекта
    // ctx.beginPath();
    // ctx.moveTo(0, objectCenterY); // Начало линии слева
    // ctx.lineTo(canvasWidth, objectCenterY); // Линия вправо до края холста
    // ctx.stroke();

    // Сбрасываем пунктирный стиль для последующих линий
    ctx.setLineDash([]);
}

export const drawMyCanvas = (ctx, canvas, currentCanvas, bool, chromokeyBackgroundImage, design) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Устанавливаем размеры холста
    canvas.width = currentCanvas.canvasProps.width;
    canvas.height = currentCanvas.canvasProps.height;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const object = { x: 0, y: 0, width: 1200, height: 1800 };

    // Задаем цвет фона
    ctx.fillStyle = currentCanvas.canvasProps.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (design) ctx.filter = 'grayscale(1)'
    else ctx.filter = 'grayscale(0)'
    
    const sortedObjects = [...currentCanvas.objects].sort((a, b) => a.zIndex - b.zIndex);

    // Отрисовываем объекты
    sortedObjects.forEach(obj => {
        ctx.save();  // Сохраняем состояние контекста

        ctx.globalAlpha = obj.opacity;
        if (obj.type !== 'image') ctx.fillStyle = obj.fill;
        setRotate(ctx, obj);

        switch (obj.type) {
            case 'rectangle':
                drawRectangle(ctx, obj);
                break;
            case 'circle':
                drawCircle(ctx, obj);
                break;
            case 'star':
                drawStar(ctx, obj);
                break;
            case 'polygon':
                drawPolygon(ctx, obj);
                break;
            case 'triangle':
                drawTriangle(ctx, obj);
                break;
            case 'line':
                drawLine(ctx, obj);
                break;
            case 'image':
                // drawCromakeyBackgroundImage(ctx, obj, chromokeyBackgroundImage);
                drawImages(ctx, obj, bool, chromokeyBackgroundImage, false);
                break;
            default:
                break;
        }

        ctx.restore();  // Восстанавливаем состояние контекста
    });

    if (currentCanvas.canvasProps.dottedLine) drawDashedCenterLines(ctx, canvasWidth, canvasHeight, object);

}
