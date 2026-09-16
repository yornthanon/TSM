package com.ticket.apigateway.service.Impl;

import com.ticket.apigateway.entity.ApiRoute;
import com.ticket.apigateway.repository.ApiRouteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Slf4j
@Service
public class RateLimiterService {

    private final StringRedisTemplate stringRedisTemplate;

    private final ApiRouteRepository apiRouteRepository;


    private static final String LUA_SCRIPT =
            "local key = KEYS[1] " +
                    "local limit = tonumber(ARGV[1]) " +
                    "local window = tonumber(ARGV[2]) " +
                    "local current = redis.call('INCR', key) " +
                    "if current == 1 then " +
                    "    redis.call('EXPIRE', key, window) " +
                    "end " +
                    "if current > limit then " +
                    "    return 0 " +
                    "else " +
                    "    return 1 " +
                    "end";

    public RateLimiterService(StringRedisTemplate stringRedisTemplate,
                              ApiRouteRepository apiRouteRepository) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.apiRouteRepository = apiRouteRepository;
    }


    public Mono<Boolean> verifyRateLimit(String path, String method, String identifier) {
        return apiRouteRepository.findByMethod(method)
                .filter(route -> route.isActive() && matches(route.getPath(), path))
                .next()
                .flatMap(routeConfig -> {
                    if (routeConfig.getRateLimited() == null) {
                        return Mono.just(true); // No rate limit for this route
                    }

                    // Construct Redis key (identifier:path:method)
                    log.info("Rate limiting for path: {}, method: {}, identifier: {}", path, method, identifier);
                    String redisKey = String.format("%s:%s:%s", identifier, path, method);
                    log.info("Redis key: {}", redisKey);

                    // Execute Lua script to enforce rate limit
                    return Mono.fromCallable(() -> stringRedisTemplate.execute(
                            RedisScript.of(LUA_SCRIPT, Long.class),
                            Collections.singletonList(redisKey),
                            routeConfig.getRateLimited().toString(),
                            routeConfig.getRateLimitDuration().toString()
                    )).map(result -> result != null && result == 1L);
                })
                .defaultIfEmpty(true); // Default to true if no route configuration is found
    }

    /**
     * Matches a request path against a route path pattern.
     * Supports trailing {@code /**} (any sub-path, including none) and {@code *}
     * (any characters within a single path segment).
     */
    private boolean matches(String pattern, String path) {
        if (pattern == null || path == null) {
            return false;
        }
        if (pattern.equals(path)) {
            return true;
        }

        StringBuilder regex = new StringBuilder();
        boolean trailingDoubleStar = pattern.endsWith("/**");
        String core = trailingDoubleStar ? pattern.substring(0, pattern.length() - 3) : pattern;

        for (int i = 0; i < core.length(); i++) {
            char c = core.charAt(i);
            if (c == '*') {
                regex.append("[^/]*");
            } else {
                if ("\\.[]{}()<>+-=!?^$|".indexOf(c) >= 0) {
                    regex.append('\\');
                }
                regex.append(c);
            }
        }
        if (trailingDoubleStar) {
            regex.append("(?:/.*)?");
        }
        return path.matches(regex.toString());
    }
}