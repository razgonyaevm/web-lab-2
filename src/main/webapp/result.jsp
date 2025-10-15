<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Результат проверки</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
</head>
<body>
<div class="header">
    <h2>Результат проверки попадания точки</h2>
    <a href="${pageContext.request.contextPath}/control" class="back-link">&larr; Вернуться к форме</a>
</div>

<jsp:useBean id="pointBean" class="com.example.model.PointBean" scope="session"/>

<c:set var="xValues" value="${requestScope.currentX}"/>
<c:set var="y" value="${requestScope.currentY}"/>
<c:set var="rValues" value="${requestScope.currentRValues}"/>
<c:set var="totalChecks" value="${requestScope.totalChecks}"/>
<c:set var="timestamp" value="${requestScope.timestamp}"/>

<c:choose>
    <c:when test="${empty xValues or empty y or empty rValues or empty totalChecks}">
        <div class="error-message">
            <h3>Ошибка отображения результатов</h3>
            <p>Не удалось получить данные для отображения результатов</p>
            <p>Пожалуйста, вернитесь на <a href="${pageContext.request.contextPath}/control">главную страницу</a> и
                попробуйте
                снова</p>
        </div>
    </c:when>
    <c:otherwise>
        <div class="result-summary">
            <h3>Текущая проверка</h3>
            <p><strong>Координаты X:</strong>
                <c:forEach items="${xValues}" var="xValue" varStatus="status">
                    ${xValue}<c:if test="${not status.last}">, </c:if>
                </c:forEach>
            </p>
            <p><strong>Координата Y:</strong> ${y}
            </p>
            <p><strong>Выбранные радиусы R:</strong>
                <c:forEach items="${rValues}" var="rValue" varStatus="status">
                    ${rValue}<c:if test="${not status.last}">, </c:if>
                </c:forEach>
            </p>
            <p><strong>Количество проверок:</strong> ${totalChecks}</p>
            <p><strong>Время проверки:</strong> ${not empty timestamp ? timestamp : 'Не указано'}</p>
        </div>


        <%-- Показываем результаты для каждого радиуса --%>
        <div class="current-check">
            <h3>Результаты проверки для каждого радиуса:</h3>
            <c:set var="currentResults" value="${pointBean.results}"/>
            <c:set var="foundResults" value="false"/>

            <c:if test="${not empty currentResults}">
                <c:set var="startIndex"
                       value="${currentResults.size() - totalChecks > 0 ? currentResults.size() - totalChecks : 0}"/>
                <c:forEach var="i" begin="${startIndex}" end="${currentResults.size() - 1}">
                    <c:set var="result" value="${currentResults[i]}"/>
                    <c:set var="isCurrentX" value="false"/>

                    <c:forEach items="${xValues}" var="xParam">
                        <c:if test="${Math.abs(result.x - xParam) < 0.001}">
                            <c:set var="isCurrentX" value="true"/>
                        </c:if>
                    </c:forEach>

                    <c:if test="${isCurrentX and Math.abs(result.y - y) < 0.001}">
                        <c:set var="foundResults" value="true"/>
                        <div class="${result.hit ? 'radius-result' : 'radius-result miss'}">
                            <strong>R = ${result.r}, X = ${result.x}, Y = ${result.y}:</strong>
                                ${result.hit ? 'Точка попадает в область' : 'Точка не попадает в область'}
                        </div>
                    </c:if>
                </c:forEach>
            </c:if>

            <c:if test="${not foundResults}">
                <p>Результаты проверки временно недоступны</p>
            </c:if>
        </div>

        <div class="results-section">
            <h3>Полная история всех проверок</h3>
            <c:choose>
                <c:when test="${not empty pointBean.results}">
                    <div class="results-info">
                        <p>Всего выполнено проверок: <strong>${pointBean.results.size()}</strong></p>
                        <p>Показаны все результаты в обратном хронологическом порядке (новые сверху)</p>
                    </div>
                    <table id="resultsTable">
                        <thead>
                        <tr>
                            <th>X</th>
                            <th>Y</th>
                            <th>R</th>
                            <th>Результат</th>
                            <th>Время проверки</th>
                            <th>Время обработки</th>
                        </tr>
                        </thead>
                        <tbody>
                        <c:forEach items="${pointBean.results}" var="result" varStatus="status">
                            <c:set var="reverseIndex" value="${pointBean.results.size() - 1 - status.index}"/>
                            <c:set var="currentResult" value="${pointBean.results[reverseIndex]}"/>

                            <tr>
                                <td>${currentResult.x}
                                </td>
                                <td>${currentResult.y}
                                </td>
                                <td>${currentResult.r}
                                </td>
                                <td class="${currentResult.hit ? 'hit' : 'miss'}">
                                        ${currentResult.hit ? 'Попадание' : 'Промах'}
                                </td>
                                <td>${currentResult.timestamp}
                                </td>
                                <td>${currentResult.processingTime} мс</td>
                            </tr>
                        </c:forEach>
                        </tbody>
                    </table>
                </c:when>
                <c:otherwise>
                    <div class="no-results">
                        <p>История результатов пуста</p>
                    </div>
                </c:otherwise>
            </c:choose>
        </div>
    </c:otherwise>
</c:choose>

<div style="margin-top: 30px; text-align: center;">
    <a href="${pageContext.request.contextPath}/control" class="btn-primary">Выполнить новую проверку</a>
    <button onclick="window.history.back()" class="btn-secondary">Назад</button>
</div>

<script src="${pageContext.request.contextPath}/js/notifications.js"></script>
<script>
    // Показываем уведомление о результате при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
        <c:if test="${not empty totalChecks}">
            <c:set var="hitCount" value="0"/>
            <c:if test="${not empty pointBean.results and not empty xValues and not empty y}">
                <c:forEach items="${pointBean.results}" var="result">
                    <c:forEach items="${xValues}" var="xParam">
                        <c:if test="${Math.abs(result.x - xParam) < 0.001 and Math.abs(result.y - y) < 0.001 and result.hit}">
                            <c:set var="hitCount" value="${hitCount + 1}"/>
                        </c:if>
                    </c:forEach>
                </c:forEach>
            </c:if>
            showNotification(
                'Выполнено ${totalChecks} проверок. Попаданий: ${hitCount} из ${totalChecks}',
                'info',
                5000
            );
        </c:if>
    });
</script>
</body>
</html>
