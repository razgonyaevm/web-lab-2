<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.example.model.PointBean" %>
<%@ page import="com.example.model.PointResult" %>
<%@ page import="java.util.List" %>
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
    <%
        String error = (String) request.getAttribute("error");
        if (error != null) {
    %>
        <div class="error-message" id="serverError">
            <strong>Ошибка:</strong> <%= error %>
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
    <%
        }
    %>

    <div class="form-container">
        <div class="form-section">
            <form id="pointForm" method="GET" action="${pageContext.request.contextPath}/control">
                <h3>Координата X:</h3>
                <div class="checkbox-group">
                    <% for (int i = -3; i <= 5; i++) { %>
                        <label>
                            <input type="checkbox" name="x" value="<%= i %>"> <%= i %>
                        </label>
                    <% } %>
                </div>

                <h3>Координата Y:</h3>
                <input type="text" id="y" name="y" placeholder="от -3 до 5" required>
                <span id="yError" class="error"></span>

                <h3>Радиус R:</h3>
                <div class="checkbox-group">
                    <% for (double r : new double[]{1, 1.5, 2, 2.5, 3}) { %>
                        <label><input type="checkbox" name="r" value="<%= r %>"> <%= r %></label>
                    <% } %>
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
                <% for (int i = -3; i <= 5; i++) { %>
                    <text x="<%= i %>" y="0.15" font-size="0.2" text-anchor="middle"><%= i %></text>
                    <line x1="<%= i %>" y1="-0.03" x2="<%= i %>" y2="0.03" stroke="black" stroke-width="0.008"/>
                    <text x="0.15" y="<%= -i %>" font-size="0.2" text-anchor="start"><%= i %></text>
                    <line x1="-0.03" y1="<%= i %>" x2="0.03" y2="<%= i %>" stroke="black" stroke-width="0.008"/>
                <% } %>
            </svg>
            <div id="plotInfo">Выберите R для отображения области</div>
        </div>
    </div>

    <div class="results-section">
        <h3>Результаты предыдущих проверок</h3>
        <%
            PointBean pointBean = (PointBean) session.getAttribute("pointBean");
            List<PointResult> allResults = null;
            if (pointBean != null) {
                allResults = pointBean.getResults();
            }
        %>

        <% if (allResults != null && !allResults.isEmpty()) { %>
            <div class="results-info">
                <p>Всего выполнено проверок: <strong><%= allResults.size() %></strong></p>
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
                    <% for (int res = allResults.size() - 1; res >= 0; res--) {
                        PointResult result = allResults.get(res);
                    %>
                        <tr>
                            <td><%= result.getX() %></td>
                            <td><%= result.getY() %></td>
                            <td><%= result.getR() %></td>
                            <td class="<%= result.isHit() ? "hit" : "miss" %>">
                                <%= result.isHit() ? "Попадание" : "Промах" %>
                            </td>
                            <td><%= result.getTimestamp() %></td>
                            <td><%= result.getProcessingTime() %> мс</td>
                        </tr>
                    <% } %>
                </tbody>
            </table>
        <% } else { %>
            <div class="no-results">
                <p>Пока не выполнено ни одной проверки</p>
                <p>Заполните форму и нажмите "Проверить" чтобы увидеть результат</p>
            </div>
        <% } %>
    </div>

    <script>
        // Глобальная переменная для хранения результатов
        window.pointResults = [
            <%
                if (pointBean != null) {
                    boolean first = true;
                    for (PointResult result : pointBean.getResults()) {
                        if (!first) out.print(",");
            %>
            {
                x: <%= result.getX() %>,
                y: <%= result.getY() %>,
                r: <%= result.getR() %>,
                hit: <%= result.isHit() %>,
                timestamp: "<%= result.getTimestamp() %>",
                processingTime: <%= result.getProcessingTime() %>
            }
            <%
                        first = false;
                    }
                }
            %>
        ];
    </script>

    <script src="${pageContext.request.contextPath}/js/notifications.js"></script>
    <script src="${pageContext.request.contextPath}/js/util.js"></script>
    <script src="${pageContext.request.contextPath}/js/validation.js"></script>
    <script src="${pageContext.request.contextPath}/js/plot.js"></script>
    <script src="${pageContext.request.contextPath}/js/main.js"></script>
</body>
</html>
