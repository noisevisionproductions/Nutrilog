CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGSERIAL  PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_email_sent TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers_metadata (
    id BIGSERIAL PRIMARY KEY,
    subscriber_id BIGINT NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    UNIQUE(subscriber_id, key)
);

CREATE TABLE IF NOT EXISTS email_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    use_template BOOLEAN NOT NULL DEFAULT FALSE,
    template_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_recipients (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_contact_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS external_recipients_tags (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    UNIQUE(recipient_id, tag)
);