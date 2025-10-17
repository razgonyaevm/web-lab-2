/**
 * Утилиты для работы с приложением
 */

/**
 * Получение конфигурации приложения из data-атрибутов
 */
function getConfig() {
    const meta = document.querySelector('meta[name="app-config"]');
    return {
        contextPath: meta?.getAttribute('data-context-path') || '',
        minX: safeParseFloat(meta, 'data-min-x', -3),
        maxX: safeParseFloat(meta, 'data-max-x', 5),
        minY: safeParseFloat(meta, 'data-min-y', -3),
        maxY: safeParseFloat(meta, 'data-max-y', 5),
        availableR: getAvailableR()
    };
}

/**
 * Получение доступных значений радиуса R из формы
 */
function getAvailableR() {
    try {
        const rInputs = document.querySelectorAll('input[name="r"]');
        return Array.from(rInputs)
            .map(input => {
                const value = parseFloat(input.value);
                return isNaN(value) ? null : value;
            })
            .filter(value => value !== null) // убираем некорректные значения
            .sort((a, b) => a - b); // сортируем по возрастанию
    } catch (error) {
        console.error('Error getting available R values:', error);
        return [1, 1.5, 2, 2.5, 3]; // значения по умолчанию
    }
}

/**
 * Функция безопасного парсинга в действительное число
 * @param element{Element} Мета элемент из которого получаем атрибут
 * @param attribute{string} Атрибут, значение которого мы парсим
 * @param defaultValue{number} Значение, которое берется, если атрибут не найден или произошла ошибка при парсинге
 * @returns {number}
 */
function safeParseFloat(element, attribute, defaultValue) {
    const value = element?.getAttribute(attribute);
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Получение всех выбранных радиусов
 * @returns {number[]} массив выбранных радиусов
 */
function getAllSelectedR() {
    const selectedCheckboxes = document.querySelectorAll('input[name="r"]:checked');
    return Array.from(selectedCheckboxes).map(cb => parseFloat(cb.value));
}

/**
 * Получение первого выбранного радиуса для отображения на графике
 * @returns {number|null} первый выбранный радиус или null если ничего не выбрано
 */
function getFirstSelectedR() {
    const selectedRValues = getAllSelectedR();
    return selectedRValues.length > 0 ? selectedRValues[0] : null;
}

/**
 * Обновление графика при изменении данных
 */
function refreshPlot() {
    const selectedR = getFirstSelectedR();
    if (selectedR !== null) {
        drawArea(selectedR);
    } else {
        redrawBaseGraph();
    }
    drawPoints();
    console.log('Plot refreshed with points:', window.pointResults ? window.pointResults.length : 0);
}

/**
 * Очистка всех ошибок валидации и уведомлений
 */
function clearValidationErrors() {
    const errorElement = document.getElementById('yError');
    if (errorElement) {
        errorElement.textContent = '';
    }

    // Очищаем все уведомления
    clearAllNotifications();

    console.log('Validation errors and notifications cleared');
}

/**
 * Обработка ошибки отправки формы
 *
 * @param {string} message - Вывод сообщения об ошибке на дисплей
 */
function onFormSubmitError(message) {
    showToast(message || 'Ошибка при отправке формы', 'error', 4000);
}

/**
 * Проверка, выбраны ли все необходимые данные для отправки
 *
 * @returns {boolean} True если форма валидна, иначе false
 */
function isFormReadyForSubmit() {
    const yValid = validateY();
    const xChecked = document.querySelectorAll('input[name="x"]:checked').length > 0;
    const rChecked = getAllSelectedR().length > 0;

    return yValid && xChecked && rChecked;
}

/**
 * Получение текущих значений формы
 *
 * @returns {Object} Форма данных с x, y и rValues
 */
function getFormData() {
    const xInputs = document.querySelectorAll('input[name="x"]:checked');
    const yInput = document.getElementById('y');
    const rCheckboxes = document.querySelectorAll('input[name="r"]:checked');

    const x = Array.from(xInputs).map(input => parseFloat(input.value));
    const y = yInput ? yInput.value : null;
    const rValues = Array.from(rCheckboxes).map(cb => parseFloat(cb.value));

    console.log('Form data - X:', x, 'Y:', y, 'R:', rValues); // Для отладки

    return { x, y, rValues };
}

/**
 * Показать статус готовности формы
 *
 * @returns {boolean} True, если форма заполнена, иначе false
 */
function showFormStatus() {
    const isReady = isFormReadyForSubmit();
    const formData = getFormData();

    if (isReady) {
        const rText = formData.rValues.length > 1 ?
            `${formData.rValues.length} радиусов` : `R=${formData.rValues[0]}`;
        showToast(`Форма готова: X=${formData.x.join(', ')}, Y=${formData.y}, ${rText}`, 'success', 2000);
    } else {
        showToast('Форма не заполнена полностью', 'warning', 2000);
    }

    return isReady;
}

/**
 * Обновление таблицы результатов
 *
 * @param {Object[]} results - Список объектов результатов
 */
function updateResultsTable(results) {
    const tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) {
        console.log('Results table not found');
        return;
    }

    if (!results || results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет результатов</td></tr>';
        return;
    }

    let html = '';

    // Показываем результаты в обратном порядке (новые сверху)
    for (let i = results.length - 1; i >= 0; i--) {
        const result = results[i];
        const resultText = result.hit ? 'Попадание' : 'Промах';
        const resultClass = result.hit ? 'hit' : 'miss';

        html += `
            <tr>
                <td>${result.x}</td>
                <td>${result.y}</td>
                <td>${result.r}</td>
                <td class="${resultClass}">${resultText}</td>
                <td>${result.timestamp || 'Не указано'}</td>
                <td>${result.processingTime || 0} мс</td>
            </tr>
        `;
    }

    tbody.innerHTML = html;
    console.log(`Results table updated with ${results.length} results`);
}

/**
 * Загрузка сохраненных результатов
 */
function loadSavedResults() {
    try {
        const savedResults = sessionStorage.getItem('pointResults');
        if (savedResults) {
            window.pointResults = JSON.parse(savedResults);
            updateResultsTable(window.pointResults);
            console.log('Loaded saved results:', window.pointResults.length);
        }
    } catch (e) {
        console.error('Error loading saved results:', e);
        window.pointResults = [];
    }
}