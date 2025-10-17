/**
 * Система уведомлений
 */


/**
 * Показать уведомление
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип сообщения (error, success, warning, info)
 * @param {number} duration - Длительность показа в миллисекундах
 * @returns {HTMLElement} - Уведомление
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Добавляем иконку в зависимости от типа
    addNotificationIcon(notification, type);
    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Автоудаление через указанное время
    const timeoutId = setTimeout(() => hideNotification(notification), duration);

    // Добавляем возможность закрытия по клику
    notification.addEventListener('click', () => {
        clearTimeout(timeoutId);
        hideNotification(notification);
    });

    console.log(`Notification shown: ${type} - ${message}`);
    return notification;
}

/**
 * Добавить иконку к уведомлению
 *
 * @param {HTMLElement} notification - Уведомление
 * @param {string} type - Тип уведомления
 */
function addNotificationIcon(notification, type) {
    const icons = {
        error: '❌',
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️'
    };

    if (icons[type]) {
        notification.textContent = `${icons[type]} ${notification.textContent}`;
    }
}

/**
 * Скрыть уведомление с анимацией
 *
 * @param {HTMLElement} notification - Уведомление, которое нужно скрыть
 */
function hideNotification(notification) {
    notification.style.opacity = '0';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Показать тостовое уведомление (для коротких сообщений)
 *
 * @param {string} message - Сообщение для вывода на дисплей
 * @param {string} type - Тип уведомления
 * @param {number} duration - Длительность уведомления в миллисекундах
 * @returns {HTMLElement} тост уведомление
 */
function showToast(message, type = 'info', duration = 3000) {
    const notification = showNotification(message, type, duration);
    notification.style.top = 'auto';
    notification.style.bottom = '20px';
    notification.style.fontSize = '14px';
    notification.style.padding = '10px 15px';

    return notification;
}

/**
 * Очистить все уведомления
 */
function clearAllNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => hideNotification(notification));
    hideServerErrors();
}

/**
 * Скрытие серверных сообщений об ошибках
 */
function hideServerErrors() {
    const serverError = document.getElementById('serverError');
    if (serverError) {
        serverError.style.display = 'none';
    }
}