package com.example.controller;

import com.example.model.PointBean;
import com.example.util.RequestParser;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/**
 * Сервлет-контроллер для обработки всех входящих запросов и делегирования полномочий
 * соответствующим компонентам
 */
@WebServlet("/control")
public class ControllerServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    processRequest(req, resp);
  }

  /**
   * Обрабатывает запросы, делегирует AreaCheckServlet, если параметры присутствуют, или очищает
   * результаты при запросе, в противном случае отображает форму.
   *
   * @param req HTTP запрос
   * @param resp HTTP ответ
   * @throws ServletException если возникает сбой при отправке запроса
   * @throws IOException если возникает сбой операций ввода-вывода
   */
  private void processRequest(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {

    RequestParser.PointParameters params = RequestParser.parsePointParameters(req);

    // Получаем или создаем bean
    PointBean pointBean = (PointBean) req.getSession().getAttribute("pointBean");
    if (pointBean == null) {
      pointBean = new PointBean();
      req.getSession().setAttribute("pointBean", pointBean);
    }

    if (params.isClearAction()) {
      pointBean.clearResults();
      resp.sendRedirect(req.getContextPath() + "/index.jsp?cleared=true");
      return;
    }

    // Проверка данных для точки
    if (params.hasPointData()) {
      req.getRequestDispatcher("/check").forward(req, resp);
    } else {
      req.getRequestDispatcher("/index.jsp").forward(req, resp);
    }
  }
}
