package com.example;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import org.apache.catalina.Context;
import org.apache.catalina.Wrapper;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;

public class Main {
  public static void main(String[] args) throws Exception {
    System.out.println("=== Starting Area Checker ===");

    Tomcat tomcat = new Tomcat();
    Connector connector = new Connector();

    String port = System.getenv().getOrDefault("PORT", "8080");
    connector.setPort(Integer.parseInt(port));
    tomcat.setConnector(connector);
    // Закрываем shutdown порт
    tomcat.getServer().setPort(-1);

    Path tempWebappDir = Files.createTempDirectory("");
    copyWebResources(tempWebappDir);

    // Настраиваем контекст
    Context context = tomcat.addWebapp("", tempWebappDir.toFile().getAbsolutePath());
    registerServlets(context);

    // Запускаем сервер
    tomcat.start();
    System.out.println("Server started: http://localhost:" + port);

    // Автоочистка при shutdown
    Runtime.getRuntime()
        .addShutdownHook(
            new Thread(
                () -> {
                  try {
                    deleteDirectory(tempWebappDir);
                  } catch (Exception e) {
                    System.err.println("Failed to clean temp dir: " + e.getMessage());
                  }
                }));

    tomcat.getServer().await();
  }

  private static void copyWebResources(Path targetDir) throws Exception {
    // Создаем структуру директорий
    Files.createDirectories(targetDir.resolve("css"));
    Files.createDirectories(targetDir.resolve("js"));

    // Список ресурсов для копирования
    String[] resources = {
      "index.jsp",
      "result.jsp",
      "css/style.css",
      "css/form.css",
      "js/main.js",
      "js/plot.js",
      "js/validation.js",
      "js/util.js",
      "js/notifications.js"
    };

    for (String resource : resources) {
      copyResource("webapp/" + resource, targetDir.resolve(resource));
    }
  }

  private static void copyResource(String resourcePath, Path targetPath) throws Exception {
    InputStream input = Main.class.getClassLoader().getResourceAsStream(resourcePath);
    if (input != null) {
      Files.copy(input, targetPath, StandardCopyOption.REPLACE_EXISTING);
    } else {
      throw new RuntimeException("Resource not found: " + resourcePath);
    }
  }

  private static void registerServlets(Context context) {
    // Регистрируем ControllerServlet
    Wrapper controllerWrapper =
        Tomcat.addServlet(context, "ControllerServlet", "com.example.controller.ControllerServlet");
    controllerWrapper.addMapping("/control");

    // Регистрируем AreaCheckServlet
    Wrapper areaCheckWrapper =
        Tomcat.addServlet(context, "AreaCheckServlet", "com.example.controller.AreaCheckServlet");
    areaCheckWrapper.addMapping("/check");
  }

  private static void deleteDirectory(Path path) throws Exception {
    if (Files.exists(path)) {
      Files.walk(path)
          .sorted((a, b) -> -a.compareTo(b))
          .forEach(
              p -> {
                try {
                  Files.delete(p);
                } catch (Exception e) {
                  // игнор
                }
              });
    }
  }
}
