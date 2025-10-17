package com.example.model;

import java.io.Serializable;
import lombok.*;

/** Представляет собой результат проверки по одной точке */
@Getter
@Setter
@AllArgsConstructor
@ToString
@EqualsAndHashCode
@NoArgsConstructor
public class PointResult implements Serializable {
  private double x;
  private double y;
  private double r;
  private boolean hit;
  private String timestamp;
  private double processingTime; // время обработки запроса в миллисекундах
}
