FROM maven:3.9.8-eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN mvn -pl user-service -am -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]
