package com.findback.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:${SPRING_DATASOURCE_URL:}}")
    private String databaseUrl;

    @Value("${spring.datasource.username:${DATABASE_USERNAME:root}}")
    private String defaultUsername;

    @Value("${spring.datasource.password:${DATABASE_PASSWORD:naresh@1979}}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.trim().isEmpty()) {
            String rawUrl = databaseUrl.trim();
            logger.info("Configuring cloud DataSource from environment URL...");

            try {
                if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
                    URI dbUri = new URI(rawUrl);
                    String userInfo = dbUri.getUserInfo();
                    String username = userInfo != null ? userInfo.split(":")[0] : defaultUsername;
                    String password = userInfo != null && userInfo.contains(":") ? userInfo.split(":")[1] : defaultPassword;
                    int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                    String dbPath = dbUri.getPath();
                    String dbName = (dbPath != null && dbPath.length() > 1) ? dbPath.substring(1) : "campusfind";

                    String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + "/" + dbName;
                    if (dbUri.getQuery() != null && !dbUri.getQuery().isEmpty()) {
                        jdbcUrl += "?" + dbUri.getQuery();
                    } else {
                        jdbcUrl += "?sslmode=require";
                    }

                    config.setJdbcUrl(jdbcUrl);
                    config.setUsername(username);
                    config.setPassword(password);
                    config.setDriverClassName("org.postgresql.Driver");
                    logger.info("Configured PostgreSQL DataSource for host: {}", dbUri.getHost());
                } else if (rawUrl.startsWith("mysql://")) {
                    URI dbUri = new URI(rawUrl);
                    String userInfo = dbUri.getUserInfo();
                    String username = userInfo != null ? userInfo.split(":")[0] : defaultUsername;
                    String password = userInfo != null && userInfo.contains(":") ? userInfo.split(":")[1] : defaultPassword;
                    int port = dbUri.getPort() == -1 ? 3306 : dbUri.getPort();
                    String dbPath = dbUri.getPath();
                    String dbName = (dbPath != null && dbPath.length() > 1) ? dbPath.substring(1) : "campusfind_db";

                    String jdbcUrl = "jdbc:mysql://" + dbUri.getHost() + ":" + port + "/" + dbName +
                            "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";

                    config.setJdbcUrl(jdbcUrl);
                    config.setUsername(username);
                    config.setPassword(password);
                    config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                    logger.info("Configured MySQL DataSource for host: {}", dbUri.getHost());
                } else if (rawUrl.startsWith("jdbc:")) {
                    config.setJdbcUrl(rawUrl);
                    config.setUsername(defaultUsername);
                    config.setPassword(defaultPassword);
                    if (rawUrl.contains("postgresql")) {
                        config.setDriverClassName("org.postgresql.Driver");
                    } else if (rawUrl.contains("mysql")) {
                        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                    }
                    logger.info("Configured direct JDBC DataSource.");
                }
            } catch (Exception ex) {
                logger.error("Error parsing database URL: {}", ex.getMessage());
            }
        }

        // Fallback to local default MySQL if no cloud URL is parsed
        if (config.getJdbcUrl() == null || config.getJdbcUrl().isEmpty()) {
            config.setJdbcUrl("jdbc:mysql://localhost:3306/campusfind_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8");
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            logger.info("Using default local MySQL DataSource configuration.");
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(20000);
        // Important: -1 prevents container crash during cold start if DB is warming up
        config.setInitializationFailTimeout(-1);

        return new HikariDataSource(config);
    }
}
