INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://user-service:8081', '/api/public/users/login', 'POST', 'User login', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/public/users/login' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://user-service:8081', '/api/v1/auth/**', 'POST', 'Authentication & tokens (login, register, logout)', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/auth/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://user-service:8081', '/api/v1/users/**', 'GET', 'User management', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/users/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://event-service:8082', '/api/v1/events/**', 'GET', 'Event service', 'event-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/events/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://ticket-service:8083', '/api/v1/tickets/**', 'GET', 'Ticket service', 'ticket-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/tickets/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://order-service:8084', '/api/v1/orders/**', 'GET', 'Order service', 'order-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/orders/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://payment-service:8085', '/api/v1/payments/**', 'GET', 'Payment service', 'payment-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/payments/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://notification-service:8086', '/api/v1/notifications/**', 'GET', 'Notification service', 'notification-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/notifications/**' AND method = 'GET');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://event-service:8082', '/api/v1/events/**', 'POST', 'Event service (create/update)', 'event-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/events/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://event-service:8082', '/api/v1/events/**', 'PUT', 'Event service (update)', 'event-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/events/**' AND method = 'PUT');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://event-service:8082', '/api/v1/events/**', 'DELETE', 'Event service (delete)', 'event-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/events/**' AND method = 'DELETE');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://ticket-service:8083', '/api/v1/tickets/**', 'POST', 'Ticket service (create/lock)', 'ticket-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/tickets/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://ticket-service:8083', '/api/v1/tickets/**', 'PUT', 'Ticket service (update)', 'ticket-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/tickets/**' AND method = 'PUT');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://order-service:8084', '/api/v1/orders/**', 'POST', 'Order service (create)', 'order-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/orders/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://order-service:8084', '/api/v1/orders/**', 'PUT', 'Order service (cancel)', 'order-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/orders/**' AND method = 'PUT');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://payment-service:8085', '/api/v1/payments/**', 'POST', 'Payment service (process/refund)', 'payment-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/payments/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://notification-service:8086', '/api/v1/notifications/**', 'POST', 'Notification service (resend)', 'notification-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/notifications/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://notification-service:8086', '/api/v1/notifications/**', 'DELETE', 'Notification service (delete)', 'notification-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/notifications/**' AND method = 'DELETE');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://ticket-service:8083', '/api/v1/tickets/**', 'DELETE', 'Ticket service (delete)', 'ticket-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/tickets/**' AND method = 'DELETE');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://user-service:8081', '/api/v1/users/**', 'PUT', 'User management (update/password/status)', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/users/**' AND method = 'PUT');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://user-service:8081', '/api/v1/users/**', 'POST', 'User management (create)', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/users/**' AND method = 'POST');

INSERT INTO api_route (uri, path, method, description, group_code, rate_limited, rate_limit_duration, status, created_at, created_by, updated_at, updated_by)
SELECT 'http://user-service:8081', '/api/v1/users/**', 'DELETE', 'User management (delete)', 'user-service', 20, 60, 'ACTIVE', NOW(), 'system', NOW(), 'system'
WHERE NOT EXISTS (SELECT 1 FROM api_route WHERE path = '/api/v1/users/**' AND method = 'DELETE');