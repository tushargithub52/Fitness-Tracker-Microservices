# ---- Build stage ----
FROM maven:3.9.11-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ---- Run stage ----
FROM eclipse-temurin:25-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/target/gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
