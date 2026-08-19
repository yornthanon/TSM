INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8081', '/api/public/users/login', 'POST', 'User login', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/public/users/login' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8081', '/api/v1/users/**', 'GET', 'User management', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/users/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8082', '/api/v1/events/**', 'GET', 'Event service', 'event-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/events/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8083', '/api/v1/tickets/**', 'GET', 'Ticket service', 'ticket-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/tickets/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8084', '/api/v1/orders/**', 'GET', 'Order service', 'order-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/orders/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8085', '/api/v1/payments/**', 'GET', 'Payment service', 'payment-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/payments/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://localhost:8086', '/api/v1/notifications/**', 'GET', 'Notification service', 'notification-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/notifications/**' AND method = 'GET');