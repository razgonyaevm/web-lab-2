package com.example;

import java.io.File;
import java.util.Objects;
import org.apache.catalina.Context;
import org.apache.catalina.WebResourceRoot;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.webresources.DirResourceSet;
import org.apache.catalina.webresources.StandardRoot;

public class Main {
  public static void main(String[] args) throws Exception {
    System.out.println("=== Starting Area Checker ===");

    Tomcat tomcat = new Tomcat();
    Connector connector = new Connector();
    if (System.getenv("PORT") == null) connector.setPort(8080);
    else connector.setPort(Integer.parseInt(System.getenv("PORT")));
    tomcat.setConnector(connector);
    // Закрываем shutdown порт
    tomcat.getServer().setPort(-1);

    String projectRoot = new File("").getAbsolutePath();
    File webappDir =
        new File(
            projectRoot
                + Objects.requireNonNullElse(System.getenv("WEBAPP-DIR"), "/src/main/webapp"));
    File classesDir =
        new File(
            projectRoot
                + Objects.requireNonNullElse(System.getenv("CLASSES-DIR"), "/target/classes"));

    // Контекст с поддержкой классов для аннотаций
    Context context = tomcat.addWebapp("", webappDir.getAbsolutePath());

    // Включаем поддержку аннотаций
    WebResourceRoot resources = new StandardRoot(context);
    resources.addPreResources(
        new DirResourceSet(resources, "/WEB-INF/classes", classesDir.getAbsolutePath(), "/"));
    context.setResources(resources);

    tomcat.start();
    System.out.println(
        "Server started: http://localhost:"
            + Objects.requireNonNullElse(System.getenv("PORT"), 8080));

    tomcat.getServer().await();
  }
}
