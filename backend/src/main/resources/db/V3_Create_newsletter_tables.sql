CREATE TABLE newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_email_sent TIMESTAMP
);

CREATE TABLE newsletter_subscribers_metadata (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    UNIQUE(subscriber_id, key)
);

CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    use_template BOOLEAN NOT NULL DEFAULT FALSE,
    template_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NO NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE external_recipients (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_contact_date TIMESTAMP
);

CREATE TABLE external_recipients_tags (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL REFERENCES external_recipients(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    UNIQUE(recipient_id, tag)
);