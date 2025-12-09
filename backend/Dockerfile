# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copiar apenas pom.xml primeiro para cache de dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar JAR da stage de build
COPY --from=build /app/target/*.jar app.jar

# Expor porta
EXPOSE 8080

# Variáveis de ambiente (serão sobrescritas pelo docker-compose)
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ironpump
ENV SPRING_DATASOURCE_USERNAME=ironpump_user
ENV SPRING_DATASOURCE_PASSWORD=iron_secret_2024

# Comando para executar
ENTRYPOINT ["java", "-jar", "app.jar"]