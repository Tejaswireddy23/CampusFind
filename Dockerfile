# ========================================================
# CampusFind Backend Production Dockerfile (Repo Root)
# ========================================================

# --- Stage 1: Build JAR ---
FROM maven:3.9.9-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Cache dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy backend source code and build production package
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Production JRE Runtime ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root system user for security
RUN groupadd -r campusfind && useradd -r -g campusfind campusfind

# Create directory for uploads and local storage
RUN mkdir -p /app/uploads && mkdir -p /app/data && chown -R campusfind:campusfind /app

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar app.jar
RUN chown campusfind:campusfind app.jar

# Switch to non-root user
USER campusfind

# Default environment variables
ENV PORT=8081 \
    SPRING_PROFILES_ACTIVE=prod \
    CAMPUSFIND_SEED_SAMPLE_DATA=false \
    UPLOAD_DIR=/app/uploads

EXPOSE 8081

ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
