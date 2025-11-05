import axios from 'axios';

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

// Search meals by first letter (we'll use multiple letters to get more data)
export async function fetchMealsFromNetwork() {
  try {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const allMeals = [];
    
    for (const letter of letters) {
      const url = `${MEALDB_BASE}/search.php?f=${letter}`;
      const response = await axios.get(url);
      if (response.data.meals) {
        allMeals.push(...response.data.meals);
      }
    }
    
    return allMeals;
  } catch (error) {
    console.error('Error fetching meals from network:', error);
    throw error;
  }
}

// Get meal by ID
export async function fetchMealById(id) {
  try {
    const url = `${MEALDB_BASE}/lookup.php?i=${id}`;
    const response = await axios.get(url);
    return response.data.meals ? response.data.meals[0] : null;
  } catch (error) {
    console.error('Error fetching meal by ID:', error);
    throw error;
  }
}

// Search meals by name
export async function searchMealsByName(query) {
  try {
    const url = `${MEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    return response.data.meals || [];
  } catch (error) {
    console.error('Error searching meals:', error);
    return [];
  }
}