package com.example.controller;

import com.example.model.PointBean;
import com.example.model.PointResult;
import com.example.util.AreaChecker;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Сервлет для проверки того, находится ли точка в пределах заданной области, и отправки результатов
 * в JSP
 */
@WebServlet("/check")
public class AreaCheckServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    processRequest(req, resp);
  }

  /**
   * Обработка GET запроса на включение контрольной точки в область
   *
   * @param req HTTP-запрос, содержащий параметры x, y и r
   * @param resp HTTP-ответ на пересылку результатов или ошибок
   * @throws ServletException при отправке запроса происходит сбой
   * @throws IOException при сбое операций ввода-вывода
   */
  private void processRequest(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    try {
      // Получаем параметры
      String[] xParams = req.getParameterValues("x");
      String yParam = req.getParameter("y");
      String[] rValues = req.getParameterValues("r");

      if (xParams == null
          || xParams.length == 0
          || yParam == null
          || rValues == null
          || rValues.length == 0) {
        throw new IllegalArgumentException("Не все параметры указаны");
      }

      double y = Double.parseDouble(yParam);

      // Валидация данных
      if (!AreaChecker.validateCoordinates(y)) {
        throw new IllegalArgumentException("Неверные координаты");
      }

      // Получаем или создаем bean для хранения результатов
      HttpSession session = req.getSession();
      PointBean pointBean = (PointBean) session.getAttribute("pointBean");
      if (pointBean == null) {
        pointBean = new PointBean();
        session.setAttribute("pointBean", pointBean);
      }

      int validRCount = 0;
      String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

      // Обрабатываем каждый радиус
      for (String xParam : xParams) {
        if (xParam == null || xParam.trim().isEmpty()) continue;

        double x = Double.parseDouble(xParam);
        if (!AreaChecker.validateCoordinates(x, y)) continue;

        for (String rStr : rValues) {
          if (rStr == null || rStr.trim().isEmpty()) continue;

          double r = Double.parseDouble(rStr.trim());
          if (!AreaChecker.validateR(r)) continue;

          long pointStartTime = System.nanoTime();
          boolean hit = AreaChecker.checkHit(x, y, r);
          long processingTime = System.nanoTime() - pointStartTime;

          double processingTimeMicros = processingTime / 1000.0;

          PointResult result = new PointResult(x, y, r, hit, timestamp, processingTimeMicros);
          pointBean.addResult(result);

          validRCount++;
          System.out.printf("Processed point: X=%.2f, Y=%.2f, R=%.2f, Hit=%b%n", x, y, r, hit);
        }
      }

      if (validRCount == 0)
        throw new IllegalArgumentException("Не предоставлены валидные значения для полей X или R");

      // Устанавливаем атрибуты для result.jsp
      req.setAttribute("currentX", xParams);
      req.setAttribute("currentY", y);
      req.setAttribute("currentRValues", rValues);
      req.setAttribute("totalChecks", validRCount);
      req.setAttribute("timestamp", timestamp);

      // Перенаправление на страницу результатов
      req.getRequestDispatcher("/result.jsp").forward(req, resp);

    } catch (Exception e) {
      System.err.println("Error processing request: " + e.getMessage());
      req.setAttribute("error", "Ошибка обработки данных: " + e.getMessage());
      req.getRequestDispatcher("/index.jsp").forward(req, resp);
    }
  }
}
