FROM maven:3.9.8-eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN mvn -pl ticket-service -am -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/ticket-service/target/*.jar app.jar
EXPOSE 8083
CMD ["java", "-jar", "app.jar"]
