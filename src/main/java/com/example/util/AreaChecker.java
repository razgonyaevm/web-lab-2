package com.example.util;

import java.util.Arrays;

/** Служебный класс для проверки того, находится ли точка в пределах заданной области */
public class AreaChecker {
  /**
   * Проверяет, находится ли точка (x, y) в пределах области, определенной радиусом r. Область
   * состоит из: - Треугольника: (0,0), (R,0), (0,R) в первом квадранте - Четверть окружности: с
   * центром в (0,0) с радиусом r/2 в третьем квадранте - Прямоугольник: (0,0), (0,-R), (R,0),
   * (R,-R) в четвертом квадранте
   *
   * @param x x-координата
   * @param y y-координата
   * @param r радиус
   * @return истинно, если точка находится в пределах области, ложно в противном случае
   */
  public static boolean checkHit(double x, double y, double r) {
    // Валидация значения радиуса
    if (!validateR(r)) return false;
    // Треугольник в первой четверти
    if (x >= 0 && y >= 0 && y <= -x + r) {
      return true;
    }

    // Четверть круга в третьей четверти
    if (x <= 0 && y <= 0 && (x * x + y * y) <= (r / 2 * r / 2)) {
      return true;
    }

    // Квадрат в четвертой четверти
    if (x >= 0 && y <= 0 && x <= r && y >= -r) {
      return true;
    }

    return false;
  }

  /**
   * Проверяет, находятся ли координаты в пределах допустимых диапазонов
   *
   * @param x x-координата
   * @param y y-координата
   * @return истинно, если координаты валидны, иначе ложь
   */
  public static boolean validateCoordinates(double x, double y) {
    return x >= -3 && x <= 5 && y >= -3 && y <= 5;
  }

  /**
   * Проверяет, находится ли координата y в пределах допустимого диапазона
   *
   * @param y y-координата
   */
  public static boolean validateCoordinates(double y) {
    return validateCoordinates(0, y);
  }

  /**
   * Проверяет, находится ли радиус в пределах допустимых значений
   *
   * @param r радиус
   * @return истинно, если радиус валидный, иначе ложь
   */
  public static boolean validateR(double r) {
    return Arrays.asList(1.0, 1.5, 2.0, 2.5, 3.0).contains(r);
  }
}
