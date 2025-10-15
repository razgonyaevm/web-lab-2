package com.example.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.NoArgsConstructor;

/** Bean для хранения результатов точечной проверки и управления ими */
@NoArgsConstructor
public class PointBean implements Serializable {
  private final List<PointResult> results = new CopyOnWriteArrayList<>();

  /**
   * Добавляет новый результат в список, сохраняя максимум 50 записей
   *
   * @param result результат - точечный результат для добавления
   */
  public void addResult(PointResult result) {
    results.add(result);

    // Ограничение на количество результатов, чтобы не накапливалось много
    if (results.size() > 50) {
      results.remove(0);
    }
  }

  /**
   * Возвращает копию списка результатов
   *
   * @return список результатов по баллам
   */
  public List<PointResult> getResults() {
    return new ArrayList<>(results);
  }

  /** Удаляет все сохраненные результаты */
  public void clearResults() {
    results.clear();
  }
}
