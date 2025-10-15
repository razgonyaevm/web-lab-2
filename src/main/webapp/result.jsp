<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.example.model.PointBean" %>
<%@ page import="com.example.model.PointResult" %>
<%@ page import="java.util.List" %>
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

<%
    // Получаем атрибуты из request
    String[] xValues = (String[]) request.getAttribute("currentX");
    Double y = (Double) request.getAttribute("currentY");
    String[] rValues = (String[]) request.getAttribute("currentRValues");
    Integer totalChecks = (Integer) request.getAttribute("totalChecks");
    String timestamp = (String) request.getAttribute("timestamp");

    PointBean pointBean = (PointBean) session.getAttribute("pointBean");
    List<PointResult> allResults = null;
    if (pointBean != null) {
        allResults = pointBean.getResults();
    }

    if (xValues == null || y == null || rValues == null || totalChecks == null) {
%>
<div class="error-message">
    <h3>Ошибка отображения результатов</h3>
    <p>Не удалось получить данные для отображения результатов</p>
    <p>Пожалуйста, вернитесь на <a href="${pageContext.request.contextPath}/control">главную страницу</a> и попробуйте
        снова</p>
</div>
<%
} else {
%>
<div class="result-summary">
    <h3>Текущая проверка</h3>
    <p><strong>Координаты X:</strong> <%= String.join(", ", xValues) %>
    </p>
    <p><strong>Координата Y:</strong> <%= y %>
    </p>
    <p><strong>Выбранные радиусы R:</strong>
        <% for (int i = 0; i < rValues.length; i++) { %>
        <%= i > 0 ? ", " : "" %><%= rValues[i] %>
        <% } %>
    </p>
    <p><strong>Количество проверок:</strong><%= totalChecks %>
    </p>
    <p><strong>Время проверки:</strong><%= timestamp != null ? timestamp : "Не указано"%>
    </p>
</div>

<%-- Показываем результаты для каждого радиуса --%>
<div class="current-check">
    <h3>Результаты проверки для каждого радиуса:</h3>
    <%
        if (allResults != null && !allResults.isEmpty()) {
            int startIndex = Math.max(0, allResults.size() - totalChecks);
            for (int i = startIndex; i < allResults.size(); i++) {
                PointResult result = allResults.get(i);
                // Проверяем, что это результат для текущей точки
                boolean isCurrentX = false;
                for (String xParam : xValues) {
                    if (Math.abs(result.getX() - Double.parseDouble(xParam)) < 0.001) {
                        isCurrentX = true;
                        break;
                    }
                }
                if (isCurrentX && Math.abs(result.getY() - y) < 0.001) {
                    String resultClass = result.isHit() ? "radius-result" : "radius-result miss";
    %>
    <div class="<%= resultClass %>">
        <strong>R = <%= result.getR() %>, X = <%= result.getX() %>, Y = <%= result.getY() %>:</strong>
        <%= result.isHit() ? "Точка попадает в область" : "Точка не попадает в область" %>
    </div>
    <%
            }
        }
    } else {
    %>
    <p>Результаты проверки временно недоступны</p>
    <%
        }
    %>
</div>

<div class="results-section">
    <h3>Полная история всех проверок</h3>
    <% if (allResults != null && !allResults.isEmpty()) { %>
    <div class="results-info">
        <p>Всего выполнено проверок: <strong><%= allResults.size() %>
        </strong></p>
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
        <% for (int i = allResults.size() - 1; i >= 0; i--) {
            PointResult result = allResults.get(i);
        %>
        <tr>
            <td><%= result.getX() %>
            </td>
            <td><%= result.getY() %>
            </td>
            <td><%= result.getR() %>
            </td>
            <td class="<%= result.isHit() ? "hit" : "miss" %>">
                <%= result.isHit() ? "Попадание" : "Промах" %>
            </td>
            <td><%= result.getTimestamp() %>
            </td>
            <td><%= result.getProcessingTime() %> мс</td>
        </tr>
        <% } %>
        </tbody>
    </table>
    <% } else { %>
    <div class="no-results">
        <p>История результатов пуста</p>
    </div>
    <% } %>
</div>
<%
    }
%>

<div style="margin-top: 30px; text-align: center;">
    <a href="${pageContext.request.contextPath}/control" class="btn-primary">Выполнить новую проверку</a>
    <button onclick="window.history.back()" class="btn-secondary">Назад</button>
</div>

<script src="${pageContext.request.contextPath}/js/notifications.js"></script>
<script>
    // Показываем уведомление о результате при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
        <%
             if (totalChecks != null) {
                 int hitCount = 0;
                 if (allResults != null && xValues != null && y != null) {
                     for (PointResult result : allResults) {
                         for (String xParam : xValues) {
                             if (Math.abs(result.getX() - Double.parseDouble(xParam)) < 0.001 &&
                                Math.abs(result.getY() - y) < 0.001 &&
                                result.isHit()) {
                                 hitCount++;
                                 break;
                             }
                         }
                     }
                 }
        %>
        showNotification(
            'Выполнено <%= totalChecks %> проверок. Попаданий: <%= hitCount %> из <%= totalChecks %>',
            'info',
            5000
        );
        <%
             }
        %>
    });
</script>
</body>
</html>
