/**
 * Система уведомлений
 */

// Стили для уведомлений
const NOTIFICATION_STYLES = {
    base: `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease-in-out;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        font-family: Arial, sans-serif;
    `,
    types: {
        error: 'background: #dc3545; border-left: 4px solid #c82333;',
        success: 'background: #28a745; border-left: 4px solid #1e7e34;',
        warning: 'background: #ffc107; color: black; border-left: 4px solid #e0a800;',
        info: 'background: #17a2b8; border-left: 4px solid #138496;'
    }
};

// Счетчик уведомлений для управления z-index
let notificationCounter = 1000;

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

    // Увеличиваем счетчик для z-index
    notificationCounter++;

    // Применяем стили
    const styles = NOTIFICATION_STYLES.base.replace('z-index: 1000;', `z-index: ${notificationCounter};`);
    notification.style.cssText = styles + NOTIFICATION_STYLES.types[type];

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

    // Добавляем анимацию при наведении
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'translateX(-5px)';
    });

    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'translateX(0)';
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