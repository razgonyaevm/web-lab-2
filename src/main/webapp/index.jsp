<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="app-config"
          data-context-path="${fn:escapeXml(pageContext.request.contextPath)}"
          data-min-x="-3" data-max-x="5"
          data-min-y="-3" data-max-y="5">
    <title>AreaChecker</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/form.css">
</head>
<body>
    <div class="header">
        <h2>ФИО: Разгоняев Максим Витальевич</h2>
        <h3>Группа: P3231</h3>
        <h3>Вариант: 2211</h3>
    </div>

    <%-- Отображение ошибок --%>
    <c:if test="${not empty requestScope.error}">
        <div class="error-message" id="serverError">
            <strong>Ошибка:</strong> ${requestScope.error}
            <button onclick="hideServerError()" style="margin-left: 10px;">x</button>
        </div>
        <script>
            // Автоматическое скрытие ошибки через 3 секунды
            setTimeout(hideServerError, 3000);
            function hideServerError() {
                const errorElement = document.getElementById('serverError');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        </script>
    </c:if>

    <div class="form-container">
        <div class="form-section">
            <form id="pointForm" method="GET" action="${pageContext.request.contextPath}/control">
                <h3>Координата X:</h3>
                <div class="checkbox-group">
                    <c:forEach var="i" begin="0" end="8">
                        <label>
                            <input type="checkbox" name="x" value="${i - 3}"> ${i - 3}
                        </label>
                    </c:forEach>
                </div>

                <h3>Координата Y:</h3>
                <input type="text" id="y" name="y" placeholder="от -3 до 5" required>
                <span id="yError" class="error"></span>

                <h3>Радиус R:</h3>
                <div class="checkbox-group">
                    <c:forEach items="${[1, 1.5, 2, 2.5, 3]}" var="r">
                        <label><input type="checkbox" name="r" value="${r}"> ${r}</label>
                    </c:forEach>
                </div>

                <br>
                <button type="submit">Проверить</button>
                <button type="submit" name="action" value="clear">Очистить данные</button>
            </form>
        </div>

        <div class="form-section">
            <h3>Область на координатной плоскости</h3>
            <svg id="plot" width="400" height="400" viewBox="-6 -6 12 12">
                <!-- Координатные оси -->
                <line x1="-6" y1="0" x2="6" y2="0" stroke="black" stroke-width="0.01"/>
                <line x1="0" y1="-6" x2="0" y2="6" stroke="black" stroke-width="0.01"/>

                <!-- Разметка осей -->
                <c:forEach var="i" begin="0" end="8">
                    <text x="${i - 3}" y="0.15" font-size="0.2" text-anchor="middle">${i - 3}</text>
                    <line x1="${i - 3}" y1="-0.03" x2="${i - 3}" y2="0.03" stroke="black" stroke-width="0.008"/>
                    <text x="0.15" y="${i - 3}" font-size="0.2" text-anchor="start">${i - 3}</text>
                    <line x1="-0.03" y1="${i - 3}" x2="0.03" y2="${i - 3}" stroke="black" stroke-width="0.008"/>
                </c:forEach>
            </svg>
            <div id="plotInfo">Выберите R для отображения области</div>
        </div>
    </div>

    <div class="results-section">
        <h3>Результаты предыдущих проверок</h3>
        <jsp:useBean id="pointBean" class="com.example.model.PointBean" scope="session"/>

        <c:choose>
            <c:when test="${not empty pointBean.results}">
                <div class="results-info">
                    <p>Всего выполнено проверок: <strong>${pointBean.results.size()}</strong></p>
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
                            <tr>
                                <td>${result.x}</td>
                                <td>${result.y}</td>
                                <td>${result.r}</td>
                                <td class="${result.hit ? 'hit' : 'miss'}">
                                    <c:choose>
                                        <c:when test="${result.hit}">Попадание</c:when>
                                        <c:otherwise>Промах</c:otherwise>
                                    </c:choose>
                                </td>
                                <td>${result.timestamp}</td>
                                <td>${result.processingTime} мс</td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
            </c:when>
            <c:otherwise>
                <div class="no-results">
                    <p>Пока не выполнено ни одной проверки</p>
                    <p>Заполните форму и нажмите "Проверить" чтобы увидеть результат</p>
                </div>
            </c:otherwise>
        </c:choose>
    </div>

    <script>
        // Глобальная переменная для хранения результатов
        window.pointResults = [
            <c:forEach items="${pointBean.results}" var="result" varStatus="status">
                {
                    x: ${result.x},
                    y: ${result.y},
                    r: ${result.r},
                    hit: ${result.hit},
                    timestamp: "${result.timestamp}",
                    processingTime: ${result.processingTime}
                }<c:if test="${not status.last}">,</c:if>
            </c:forEach>
        ];
    </script>

    <script src="${pageContext.request.contextPath}/js/notifications.js"></script>
    <script src="${pageContext.request.contextPath}/js/util.js"></script>
    <script src="${pageContext.request.contextPath}/js/validation.js"></script>
    <script src="${pageContext.request.contextPath}/js/plot.js"></script>
    <script src="${pageContext.request.contextPath}/js/main.js"></script>
</body>
</html>
