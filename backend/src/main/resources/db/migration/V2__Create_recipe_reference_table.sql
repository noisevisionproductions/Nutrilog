CREATE TABLE IF NOT EXISTS recipe_references (
    id VARCHAR(255) PRIMARY KEY,
    recipe_id VARCHAR(255) NOT NULL,
    diet_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    meal_type VARCHAR(50) NOT NULL,
    added_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(external_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_references_recipe_id ON recipe_references(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_references_diet_id ON recipe_references(diet_id);
CREATE INDEX IF NOT EXISTS idx_recipe_references_user_id ON recipe_references(user_id);