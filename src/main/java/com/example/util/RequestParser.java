package com.example.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;

public class RequestParser {

  /** Извлекает и валидирует параметры точки из запроса */
  public static PointParameters parsePointParameters(HttpServletRequest req) {
    String[] xParams = req.getParameterValues("x");
    String yParam = req.getParameter("y");
    String[] rValues = req.getParameterValues("r");
    String action = req.getParameter("action");

    return new PointParameters(xParams, yParam, rValues, action);
  }

  /** Проверяет, содержит ли запрос данные для проверки точки */
  public static boolean hasPointData(HttpServletRequest req) {
    PointParameters params = parsePointParameters(req);
    return params.hasPointData();
  }

  /** Проверяет, является ли запрос очисткой данных */
  public static boolean isClearAction(HttpServletRequest req) {
    return "clear".equals(req.getParameter("action"));
  }

  // DTO класс для хранения параметров
  @Getter
  public static class PointParameters {
    private final String[] xParams;
    private final String yParam;
    private final String[] rValues;
    private final String action;

    public PointParameters(String[] xParams, String yParam, String[] rValues, String action) {
      this.xParams = xParams;
      this.yParam = yParam;
      this.rValues = rValues;
      this.action = action;
    }

    public boolean hasPointData() {
      return xParams != null
          && xParams.length > 0
          && yParam != null
          && rValues != null
          && rValues.length > 0;
    }

    public boolean isClearAction() {
      return "clear".equals(action);
    }
  }
}
