# Back4app builds from the repository root, so the Dockerfile must also be at root.
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the complete Maven multi-module project because app-monolith depends on
# common and the service modules.
COPY . .
RUN mvn -pl app-monolith -am -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/app-monolith/target/*.jar /app/app.jar

# Back4app detects this exposed web port. Spring Boot reads PORT at runtime
# through app-monolith/src/main/resources/application.properties.
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
