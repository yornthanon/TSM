FROM maven:3.9.8-eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN mvn -pl admin-service -am -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/admin-service/target/*.jar app.jar
ENV JAVA_OPTS=""
EXPOSE 8090
CMD ["sh", "-c", "java $JAVA_OPTS -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -Dserver.port=${PORT:-8090} -jar /app/app.jar"]
