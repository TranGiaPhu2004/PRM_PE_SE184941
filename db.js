import * as SQLite from "expo-sqlite";

let db;

async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("meals.db");
  }
  return db;
}

// Initialize database tables
export async function initDB() {
  const database = await getDB();
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS meals (
      idMeal TEXT PRIMARY KEY NOT NULL,
      strMeal TEXT,
      strCategory TEXT,
      strArea TEXT,
      strInstructions TEXT,
      strMealThumb TEXT,
      strTags TEXT,
      strYoutube TEXT,
      ingredients TEXT,
      raw TEXT
    );
    
    CREATE TABLE IF NOT EXISTS favorites (
      idMeal TEXT PRIMARY KEY NOT NULL
    );
  `);
}

// Upsert meals into database
export async function upsertMeals(meals) {
  const database = await getDB();
  
  for (const meal of meals) {
    // Extract ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: measure ? measure.trim() : ""
        });
      }
    }
    
    await database.runAsync(
      `INSERT OR REPLACE INTO meals 
       (idMeal, strMeal, strCategory, strArea, strInstructions, strMealThumb, strTags, strYoutube, ingredients, raw) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        meal.idMeal,
        meal.strMeal,
        meal.strCategory || "",
        meal.strArea || "",
        meal.strInstructions || "",
        meal.strMealThumb || "",
        meal.strTags || "",
        meal.strYoutube || "",
        JSON.stringify(ingredients),
        JSON.stringify(meal)
      ]
    );
  }
}

// Get all meals from database
export async function getAllMeals() {
  const database = await getDB();
  const result = await database.getAllAsync(
    `SELECT * FROM meals ORDER BY strMeal;`
  );
  return result;
}

// Get meal by ID
export async function getMealById(id) {
  const database = await getDB();
  const result = await database.getFirstAsync(
    `SELECT * FROM meals WHERE idMeal = ?;`,
    [id]
  );
  return result;
}

// Get all favorites
export async function getFavorites() {
  const database = await getDB();
  const result = await database.getAllAsync(
    `SELECT meals.* FROM meals 
     JOIN favorites ON meals.idMeal = favorites.idMeal 
     ORDER BY meals.strMeal;`
  );
  return result;
}

// Check if meal is favorite
export async function isFavorite(mealId) {
  const database = await getDB();
  const result = await database.getFirstAsync(
    `SELECT idMeal FROM favorites WHERE idMeal = ?;`,
    [mealId]
  );
  return result !== null;
}

// Add to favorites
export async function addFavorite(mealId) {
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO favorites (idMeal) VALUES (?);`,
    [mealId]
  );
}

// Remove from favorites
export async function removeFavorite(mealId) {
  const database = await getDB();
  await database.runAsync(
    `DELETE FROM favorites WHERE idMeal = ?;`,
    [mealId]
  );
}

// Get all categories from stored meals
export async function getCategories() {
  const database = await getDB();
  const result = await database.getAllAsync(
    `SELECT DISTINCT strCategory FROM meals WHERE strCategory != '' ORDER BY strCategory;`
  );
  return result.map(row => row.strCategory);
}