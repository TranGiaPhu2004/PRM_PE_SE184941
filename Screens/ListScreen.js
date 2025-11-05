import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl
} from "react-native";
import { getAllMeals, upsertMeals, initDB, getCategories } from "../db";
import { fetchMealsFromNetwork } from "../api";

export default function ListScreen({ navigation }) {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      await initDB();
      
      // Load from cache first
      const cached = await getAllMeals();
      if (cached.length > 0) {
        setMeals(cached);
        setFilteredMeals(cached);
        await loadCategories();
        setLoading(false);
      }

      // Fetch from network
      const data = await fetchMealsFromNetwork();
      await upsertMeals(data);
      
      // Reload from database to get fresh data
      const updatedMeals = await getAllMeals();
      setMeals(updatedMeals);
      setFilteredMeals(updatedMeals);
      await loadCategories();
      setError("");
      
    } catch (err) {
      console.error("Load data error:", err);
      const cached = await getAllMeals();
      if (cached.length === 0) {
        setError("Could not load data. Please check your connection.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadCategories() {
    const cats = await getCategories();
    setCategories(cats);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
  }

  function handleSearch(text) {
    setSearch(text);
    filterList(text, selectedCategory);
  }

  function handleCategorySelect(category) {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    filterList(search, newCategory);
  }

  function filterList(searchText, category) {
    let filtered = [...meals];
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(meal => meal.strCategory === category);
    }
    
    // Filter by search text
    if (searchText && searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(meal =>
        meal.strMeal.toLowerCase().includes(query)
      );
    }
    
    setFilteredMeals(filtered);
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>Loading meals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search meals..."
        value={search}
        onChangeText={handleSearch}
        style={styles.searchInput}
      />

      {/* Category Filter */}
      {categories.length > 0 && (
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleCategorySelect(item)}
                style={[
                  styles.categoryButton,
                  selectedCategory === item && styles.categoryButtonActive
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.categoryTextActive
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results Count */}
      <Text style={styles.resultCount}>
        {filteredMeals.length} meal{filteredMeals.length !== 1 ? 's' : ''} found
      </Text>

      {/* Meals List */}
      <FlatList
        data={filteredMeals}
        keyExtractor={item => item.idMeal}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mealCard}
            onPress={() => navigation.navigate("Detail", { id: item.idMeal })}
          >
            <Image
              source={{ uri: item.strMealThumb }}
              style={styles.mealImage}
            />
            <View style={styles.mealInfo}>
              <Text style={styles.mealTitle} numberOfLines={2}>
                {item.strMeal}
              </Text>
              <Text style={styles.mealCategory}>{item.strCategory}</Text>
              {item.strArea && (
                <Text style={styles.mealArea}>🌍 {item.strArea}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meals found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryContainer: {
    marginBottom: 10,
    height: 45,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginLeft: 4,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  mealInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealCategory: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
    marginBottom: 2,
  },
  mealArea: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});