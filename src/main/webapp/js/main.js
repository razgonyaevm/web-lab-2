/**
 * Главный файл инициализации приложения.
 * Инициализирует все компоненты после загрузки DOM
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing Area Checker Application...');

    // Очищаем любые старые уведомления при загрузке
    clearAllNotifications();

    // Показываем приветственное сообщение
    showToast('Приложение загружено', 'success', 2000);

    // Восстанавливаем состояние страницы ДО инициализации компонентов
    restorePageState();

    // Инициализация всех компонентов
    initializeApplication();

    // Проверка действия очистки от сервера
    if (window.location.search.includes('cleared=true')) {
        onClearSuccess();
    }

    console.log('Application initialized successfully');
});

/**
 * Инициализация всех компонентов приложения
 */
function initializeApplication() {
    initializeValidation();
    initializeForm();
    initializeRCheckboxes();
    initializePlot();
    initializeClearButton();
    initializeQuickActions();
    initializeStatusChecker();
    initializeFormPreviewListeners();

    console.log('Application initialized successfully');
}

/**
 * Инициализация валидации поля Y
 */
function initializeValidation() {
    const yInput = document.getElementById('y');
    if (yInput) {
        yInput.addEventListener('input', () => {
            yInput.value = yInput.value.replace(/[^\d.,-]/g, '').replace(',', '.');
            validateY();
            updateFormStatusIndicator();
        });
        console.log('Y validation initialized');
    }
}

/**
 * Инициализация обработки формы
 */
function initializeForm() {
    const form = document.getElementById('pointForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            // Только проверяем валидность, но не предотвращаем отправку
            if (!validateForm()) {
                e.preventDefault(); // Только если форма не валидна
                onFormSubmitError('Исправьте ошибки в форме');
                return;
            }

            // Форма отправится стандартным способом
            const formData = getFormData();
            const rText = formData.rValues.length > 1 ?
                `${formData.rValues.length} радиусов` : `R=${formData.rValues[0]}`;
            showToast(`Отправка: X=${formData.x}, Y=${formData.y}, ${rText}`, 'success', 2000);
        });
        console.log('Form handler initialized');
    }
}

/**
 * Инициализация обработчиков чекбоксов R
 */
function initializeRCheckboxes() {
    const rCheckboxes = document.querySelectorAll('input[name="r"]');
    rCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            handleRCheckboxChange();
            updateFormStatusIndicator();
            handlePlotMouseLeave();
        });
    });
    console.log('R checkboxes initialized');
}

/**
 * Инициализация кнопки очистки
 */
function initializeClearButton() {
    const clearButton = document.querySelector('button[name="action"][value="clear"]');
    if (clearButton) {
        clearButton.addEventListener('click', async (e) => {
            e.preventDefault();
            // Подтверждение очистки
            if (confirm('Вы уверены, что хотите очистить все результаты?')) {
                showToast('Очистка результатов...', 'info', 2000);

                try {
                    // Отправляем запрос на сервер для очистки
                    const response = await fetch(`${getConfig().contextPath}/control?cleared=true`, {
                        method: 'GET'
                    });

                    if (response.ok) onClearSuccess();
                    else {
                        showToast('Ошибка при очистке данных на сервере', 'error', 4000);
                        console.error('Server clear request failed: ', response.status);
                    }
                } catch (error) {
                    showToast('Ошибка сети при очистке данных', 'error', 4000);
                    console.error('Network error during request: ', error);
                }
            } else {
                showToast('Очистка отменена', 'warning', 1500);
            }
        });
        console.log('Clear button initialized');
    }
}

/**
 * Обработка успешной очистки результатов
 */
function onClearSuccess() {
    // Очищаем клиентские данные
    window.pointResults = [];
    sessionStorage.removeItem('pointResults');
    clearPoints();
    updateResultsTable([]);
    clearValidationErrors();
    refreshPlot();
    updateFormStatusIndicator();
    showToast('Все результаты успешно очищены', 'success', 3000);
    console.log('Results cleared on client-side');
}

/**
 * Инициализация быстрых действий
 */
function initializeQuickActions() {
    document.addEventListener('keydown', (e) => {
        const form = document.getElementById('pointForm');

        // Ctrl + Enter для быстрой отправки формы
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            if (form && isFormReadyForSubmit()) {
                showFormStatus();
                showToast('Быстрая отправка формы (Ctrl+Enter)', 'info', 2000);
                form.requestSubmit();
            } else {
                showToast('Форма не готова для отправки', 'warning', 2000);
            }
        }

        // Escape для очистки уведомлений
        if (e.key === 'Escape') {
            clearAllNotifications();
            showToast('Уведомления очищены', 'info', 1000);
        }

        // F2 для проверки статуса формы
        if (e.key === 'F2') {
            e.preventDefault();
            showFormStatus();
        }
    });

    console.log('Quick actions initialized');
}

/**
 * Инициализация проверки статуса формы
 */
function initializeStatusChecker() {
    createStatusIndicator();
    setInterval(updateFormStatusIndicator, 2000);
    console.log('Form status checker initialized');
}

/**
 * Создание индикатора статуса формы
 */
function createStatusIndicator() {
    if (document.getElementById('formStatusIndicator')) {
        return;
    }

    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'formStatusIndicator';
    statusIndicator.className = 'not-ready';
    document.body.appendChild(statusIndicator);
    updateFormStatusIndicator();

    console.log('Form status indicator created');
}

/**
 * Обновление индикатора статуса формы
 */
function updateFormStatusIndicator() {
    const statusIndicator = document.getElementById('formStatusIndicator');
    if (!statusIndicator) return;

    const isReady = isFormReadyForSubmit();
    const formData = getFormData();

    if (isReady) {
        const rText = formData.rValues.length > 1 ?
            `${formData.rValues.length} радиусов` : `R=${formData.rValues[0]}`;
        statusIndicator.textContent = `✓ Готово: X=[${formData.x.join(', ')}], Y=${formData.y}, ${rText}`;
        statusIndicator.className = 'ready';
    } else {
        statusIndicator.textContent = '✗ Форма не заполнена';
        statusIndicator.className = 'not-ready';
    }
}

/**
 * Восстановление состояния при загрузке страницы
 */
function restorePageState() {
    console.log('Restoring page state...');

    // Загружаем результаты через loadSavedResults
    loadSavedResults();

    window.previewPoint = null;

    refreshPlot();
    updateFormStatusIndicator();

    console.log('Preview point reset on page load');
}

/**
 * Функция для listener-ов preview
 */
function initializeFormPreviewListeners() {
    const xCheckboxes = document.querySelectorAll('input[name="x"]');
    const yInput = document.getElementById('y');
    const rCheckboxes = document.querySelectorAll('input[name="r"]');

    // Listener на X
    xCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePreviewPoint);
    });

    // Listener на Y
    if (yInput) {
        yInput.addEventListener('input', updatePreviewPoint);
    }

    // Listener на R
    rCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePreviewPoint);
    });

    console.log('Form preview listeners initialized');
}

/**
 * Функция для обновления preview
 */
function updatePreviewPoint() {
    const formData = getFormData();
    console.log('updatePreviewPoint - formData.x:', formData.x, 'length: ', formData.x.length);

    if (formData.x.length > 0 && formData.y && formData.rValues.length > 0) {
        window.previewPoint = {
            x: formData.x,
            y: parseFloat(formData.y),
            r: formData.rValues[0],
            timestamp: Date.now()
        };
        console.log('Preview point updated from form:', window.previewPoint);
        refreshPlot();
    } else {
        console.log('previewPoint cleared - missing data')
        window.previewPoint = null;
        refreshPlot();
    }
}