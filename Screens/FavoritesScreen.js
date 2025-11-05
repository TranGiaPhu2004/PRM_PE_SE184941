import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getFavorites, getCategories, removeFavorite } from "../db";
import { useFocusEffect } from "@react-navigation/native";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Reload favorites every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
      loadCategories();
    }, [])
  );

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
      setFilteredFavorites(data);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  function handleSearch(text) {
    setSearch(text);
    applyFilter(text, selectedCategory);
  }

  function handleCategorySelect(category) {
    const cat = selectedCategory === category ? null : category;
    setSelectedCategory(cat);
    applyFilter(search, cat);
  }

  function applyFilter(searchText, category) {
    let filtered = [...favorites];

    // Filter by category
    if (category) {
      filtered = filtered.filter(m => m.strCategory === category);
    }

    // Filter by search text
    if (searchText && searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(m => m.strMeal.toLowerCase().includes(q));
    }

    setFilteredFavorites(filtered);
  }

  async function handleRemoveFavorite(idMeal) {
    try {
      await removeFavorite(idMeal);
      // Reload and reapply filters
      await loadFavorites();
      applyFilter(search, selectedCategory);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>You have no favorites yet</Text>
        <Text style={styles.emptyText}>
          Start adding your favorite meals from the list!
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate("List")}
        >
          <Text style={styles.browseButtonText}>Browse Meals</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search favorites..."
        value={search}
        onChangeText={handleSearch}
        style={styles.searchInput}
        placeholderTextColor="#999"
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
                  selectedCategory === item && styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item && styles.categoryTextActive,
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
        {filteredFavorites.length} favorite{filteredFavorites.length !== 1 ? "s" : ""}
      </Text>

      {/* Favorites List */}
      <FlatList
        data={filteredFavorites}
        keyExtractor={item => item.idMeal}
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

            {/* Remove Favorite Button */}
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(item.idMeal);
              }}
            >
              <Text style={styles.removeIcon}>💔</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No favorites match your search</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearch("");
                setSelectedCategory(null);
                setFilteredFavorites(favorites);
              }}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F5F5F5",
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  categoryContainer: {
    marginBottom: 10,
    height: 45,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#E74C3C",
    borderColor: "#E74C3C",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },
  resultCount: {
    marginBottom: 10,
    color: "#666",
    marginLeft: 4,
    fontSize: 14,
  },
  mealCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  mealImage: {
    width: 100,
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  mealInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    paddingRight: 50,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  mealCategory: {
    fontSize: 14,
    color: "#E74C3C",
    fontWeight: "500",
    marginBottom: 2,
  },
  mealArea: {
    fontSize: 12,
    color: "#999",
  },
  removeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  removeIcon: {
    fontSize: 20,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});