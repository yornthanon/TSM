-- Create all required databases for the microservices
CREATE DATABASE ticket_user_db;
CREATE DATABASE ticket_event_db;
CREATE DATABASE ticket_db;
CREATE DATABASE ticket_order_db;
CREATE DATABASE ticket_payment_db;
CREATE DATABASE ticket_notification_db;
CREATE DATABASE ticket_gateway_db;

-- Create a dedicated user for each database (optional but recommended)
-- For simplicity, we'll use the same 'ticket' user for all databases
