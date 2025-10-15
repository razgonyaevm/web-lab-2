/**
 * Валидационные функции для данных формы
 */

/**
 * Валидация поля Y
 *
 * @returns {boolean} True если валидно, false если нет
 */
function validateY() {
    const yInput = document.getElementById('y');
    const yValueStr = yInput.value.trim();
    const errorElement = document.getElementById('yError');

    if (!errorElement) {
        console.error('Error element not found');
        return false;
    }

    // Проверка на пустое значение
    if (yInput.value.trim() === '') {
        errorElement.textContent = 'Поле Y не может быть пустым';
        return false;
    }

    if (!/^-?\d*[,.]?\d*$/.test(yValueStr) && !/^-?\d*,?\d*$/.test(yValueStr)) {
        errorElement.textContent = 'Y должен содержать только цифры, точку, запятую или минус';
        return false;
    }

    const normalizedValue = yValueStr.replace(',', '.');
    const yValue = parseFloat(normalizedValue);

    // Проверка на число
    if (isNaN(yValue)) {
        errorElement.textContent = 'Y должен быть числом';
        return false;
    }

    // Проверка диапазона
    if (yValue < -3 || yValue > 5) {
        errorElement.textContent = 'Y должен быть в диапазоне от -3 до 5';
        return false;
    }

    errorElement.textContent = '';
    return true;
}

/**
 * Валидация всей формы перед отправкой
 *
 * @returns {boolean} True если форма валидна, false если нет
 */
function validateForm() {
    // Очищаем старые уведомления перед новой проверкой
    clearAllNotifications();

    const formData = getFormData();
    console.log('Validating form data:', formData);

    // Проверяем X
    if (!formData.x || formData.x.length === 0) {
        showToast('Выберите хотя бы одну координату X', 'error', 3000);
        return false;
    }

    // Проверяем Y
    if (!formData.y || !validateY()) {
        showToast('Исправьте ошибки в поле Y', 'error', 3000);
        return false;
    }

    // Проверяем R
    if (!formData.rValues || formData.rValues.length === 0) {
        showToast('Выберите хотя бы один радиус R', 'error', 3000);
        return false;
    }

    const rText = formData.rValues.length > 1 ?
        `${formData.rValues.length} радиусов` : `R=${formData.rValues[0]}`;

    showToast(`Проверка: X=${formData.x.join(', ')}, Y=${formData.y}, ${rText}`, 'info', 2000);

    return true;
}