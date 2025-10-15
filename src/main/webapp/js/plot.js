/**
 * Инициализация графика и обработчиков событий
 */
function initializePlot() {
    const plotContainer = document.querySelector('.form-section');
    if (!plotContainer) return;

    // Удаляем старый SVG и создаем Canvas
    const oldPlot = document.getElementById('plot');
    if (oldPlot) {
        const canvas = document.createElement('canvas');
        canvas.id = 'plotCanvas';
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.border = '1px solid #000';
        canvas.style.cursor = 'crosshair';

        oldPlot.replaceWith(canvas);
    }

    const canvas = document.getElementById('plotCanvas');
    if (canvas) {
        canvas.addEventListener('click', handlePlotClick);
        canvas.addEventListener('mousemove', handlePlotMouseMove);
        canvas.addEventListener('mouseleave', handlePlotMouseLeave);

        // Сразу рисуем базовый график
        redrawBaseGraph();
    }

    console.log('Canvas plot initialized');
}

/**
 * Обработка клика по графику
 *
 * @param {MouseEvent} e - Событие клика мышки
 */
function handlePlotClick(e) {
    const config = getConfig();
    const canvas = document.getElementById('plotCanvas');
    const plotInfo = document.getElementById('plotInfo');
    const rect = canvas.getBoundingClientRect();

    // Преобразование координат мыши в математические координаты
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const plotX = (x / 400 * 12 - 6);
    const plotY = (6 - y / 400 * 12);

    // Округляем X для соответствия checkbox
    const roundedX = Math.round(plotX);
    const preciseY = Math.round(plotY * 100) / 100;

    // Проверяем, выбран ли хотя бы один радиус
    const selectedRValues = getAllSelectedR();
    if (selectedRValues.length === 0) {
        showToast('Сначала выберите хотя бы один радиус R', 'warning', 3000);
        return;
    }

    // Проверяем, что клик был в допустимой области графика
    if (plotX < config.minX || plotX > config.maxX || plotY < config.minY || plotY > config.maxY) {
        showToast(`Координаты должны быть в диапазоне: X[${config.minX}..${config.maxX}], Y[${config.minY}..${config.maxY}]`, 'warning', 3000);
        return;
    }

    // Устанавливаем значение X в чекбоксы (выбираем только одно значение для клика)
    const xCheckbox = document.querySelector(`input[name="x"][value="${roundedX}"]`);
    if (xCheckbox) {
        // Снимаем выбор со всех чекбоксов X и выбираем только текущий
        document.querySelectorAll('input[name="x"]').forEach(cb => cb.checked = false);
        xCheckbox.checked = true;
    } else {
        showToast(`X=${roundedX} не доступен для выбора`, 'warning', 3000);
        return;
    }

    // Устанавливаем значение Y
    const yInput = document.getElementById('y');
    if (yInput) {
        yInput.value = preciseY;
    }

    // Показываем информацию о точке в тосте
    const rText = selectedRValues.length > 1 ?
        `${selectedRValues.length} радиусов` : `R=${selectedRValues[0]}`;
    showToast(`Установлено: X=${roundedX}, Y=${preciseY} (${rText})`, 'success', 2000);

    if (plotInfo) {
        plotInfo.textContent = `Установлено: X=${roundedX}, Y=${preciseY}`;
    }

    const formData = getFormData();
    console.log('Form data before submit: ', formData);

    if (isFormReadyForSubmit()) {
        const form = document.getElementById('pointForm');
        if (form) {
            showToast('Отправка формы (по клику)', 'info', 2000);

            form.requestSubmit();

            console.log(`Plot click SUCCESS: X=${roundedX}, Y=${preciseY}, R=[${selectedRValues.join(', ')}] - Form submitted`);
        }
    } else {
        const formData = getFormData();
        let errorMessage = 'Форма не готова к отправке: ';

        if (formData.x.length === 0) errorMessage += 'X не выбран, ';
        if (!formData.y || !validateY()) errorMessage += 'Y некорректен, ';
        if (formData.rValues.length === 0) errorMessage += 'R не выбран';

        showToast(errorMessage, 'warning', 4000);
        console.log('Plot click FAILED - Form not ready: ', formData);

        refreshPlot();
        updateFormStatusIndicator();
    }
}

/**
 * Обработка движения мыши по графику (показ координат)
 *
 * @param {MouseEvent} e - Событие движения мыши
 */
function handlePlotMouseMove(e) {
    const canvas = document.getElementById('plotCanvas');
    const plotInfo = document.getElementById('plotInfo');
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const plotX = (x / 400 * 12 - 6).toFixed(2);
    const plotY = (6 - y / 400 * 12).toFixed(2);

    if (plotInfo) {
        const selectedRValues = getAllSelectedR();
        const rInfo = selectedRValues.length > 0 ?
            ` | Выбрано R: ${selectedRValues.length}` : ' | Выберите R';
        plotInfo.textContent = `Координаты: X=${plotX}, Y=${plotY}${rInfo}`;
    }
}

/**
 * Обработка ухода мыши с графика
 */
function handlePlotMouseLeave() {
    const plotInfo = document.getElementById('plotInfo');
    if (plotInfo) {
        const selectedRValues = getAllSelectedR();
        if (selectedRValues.length === 0) {
            plotInfo.textContent = 'Выберите R для отображения области';
        } else {
            const rText = selectedRValues.length > 1 ?
                `${selectedRValues.length} радиусов` : `R=${selectedRValues[0]}`;
            plotInfo.textContent = `Отображается область для ${rText}. Кликните для выбора точки`;
        }
    }
}

/**
 * Отрисовка области на графике для конкретного радиуса
 *
 * @param {number} r - Радиус
 */
function drawArea(r) {
    const canvas = document.getElementById('plotCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    redrawBaseGraph();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 30;

    // Очищаем только область, сохраняя точки
    redrawBaseGraph();

    // Рисуем область
    ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1;

    // 1. Квадрат (четвертая четверть)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + r * scale, centerY);
    ctx.lineTo(centerX + r * scale, centerY + r * scale);
    ctx.lineTo(centerX, centerY + r * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Треугольник (первая четверть)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - r * scale);
    ctx.lineTo(centerX + r * scale, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Четверть круга (третья четверть)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, (r / 2) * scale, Math.PI, 1.5 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    console.log(`Area drawn for R=${r}`);
}

/**
 * Отрисовка базовой системы координат
 */
function redrawBaseGraph() {
    const canvas = document.getElementById('plotCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 30;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем оси
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Ось X
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Ось Y
    ctx.beginPath();
    ctx.moveTo(centerX, canvas.height);
    ctx.lineTo(centerX, 0);
    ctx.stroke();

    // Стрелки
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, centerY - 5);
    ctx.lineTo(canvas.width, centerY);
    ctx.lineTo(canvas.width - 10, centerY + 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX - 5, 10);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + 5, 10);
    ctx.fill();

    // Подписи осей
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText('X', canvas.width - 15, centerY - 10);
    ctx.fillText('Y', centerX + 10, 15);

    // Засечки и подписи
    const values = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
    values.forEach(val => {
        const xPos = centerX + val * scale;
        const yPos = centerY - val * scale;

        // Засечки на оси X
        ctx.beginPath();
        ctx.moveTo(xPos, centerY - 5);
        ctx.lineTo(xPos, centerY + 5);
        ctx.stroke();
        ctx.fillText(val.toString(), xPos - 5, centerY + 20);

        // Засечки на оси Y
        ctx.beginPath();
        ctx.moveTo(centerX - 5, yPos);
        ctx.lineTo(centerX + 5, yPos);
        ctx.stroke();
        ctx.fillText(val.toString(), centerX - 20, yPos + 5);
    });
}

/**
 * Отрисовка всех точек из истории результатов для конкретного R
 */
function drawPoints() {
    const canvas = document.getElementById('plotCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 30;

    // Получаем текущий отображаемый радиус
    const currentR = getFirstSelectedR();

    // Фильтруем точки по текущему радиусу
    const pointsForCurrentR = window.pointResults ? window.pointResults.filter(result =>
        Math.abs(result.r - currentR) < 0.001
    ) : [];

    // Отрисовываем точки для текущего радиуса
    pointsForCurrentR.forEach((result) => {
        const canvasX = centerX + result.x * scale;
        const canvasY = centerY - result.y * scale;

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = result.hit ? 'green' : 'red';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
    });

    let previewPoint = window.previewPoint;

    // Рисуем точку предпросмотра
    if (previewPoint) {
        // Рисуем точки предпросмотра для всех выбранных координат X
        const xValues = Array.isArray(previewPoint.x) ? previewPoint.x : [previewPoint.x];
        console.log("PREVIEW POINT: " + xValues.join(", "));

        xValues.forEach((xValue, index) => {
            const canvasX = centerX + xValue * scale;
            const canvasY = centerY - previewPoint.y * scale;

            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            // Подпись для точки предпросмотра
            ctx.font = '10px Arial';
            ctx.fillStyle = '#000';
            const labelY = canvasY - 5 - (index * 12);
            ctx.fillText(`(${xValue.toFixed(2)}, ${previewPoint.y.toFixed(2)})`, canvasX + 5, labelY);

            console.log('Drawing preview point:', previewPoint);
        });
    }

    console.log(`Drawn ${pointsForCurrentR.length} points for R=${currentR}`);
}

/**
 * Очистка всех точек с графика
 */
function clearPoints() {
    window.previewPoint = null;
    localStorage.removeItem('previewPoint');
    refreshPlot();
    console.log('All points cleared from plot');
}

/**
 * Обработка изменения чекбоксов R
 */
function handleRCheckboxChange() {
    const selectedRValues = getAllSelectedR();

    if (selectedRValues.length === 0) {
        showToast('Радиус не выбран', 'warning', 2000);
    } else if (selectedRValues.length === 1) {
        showToast(`Установлен радиус R = ${selectedRValues[0]}`, 'info', 2000);
    } else {
        showToast(`Выбрано радиусов: ${selectedRValues.length}`, 'info', 2000);
    }

    refreshPlot();
}

