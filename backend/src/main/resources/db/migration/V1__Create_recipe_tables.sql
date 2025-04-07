CREATE TABLE IF NOT EXISTS recipes (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    calories DOUBLE PRECISION,
    protein DOUBLE PRECISION,
    fat DOUBLE PRECISION,
    carbs DOUBLE PRECISION,
    parent_recipe_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS recipe_photos (
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    photo_url VARCHAR(1000) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recipe_external_id ON recipes(external_id);
CREATE INDEX IF NOT EXISTS idx_recipe_parent_id ON recipes(parent_recipe_id);