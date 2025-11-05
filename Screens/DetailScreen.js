import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Alert
} from "react-native";
import { getMealById, isFavorite, addFavorite, removeFavorite } from "../db";

export default function DetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    loadMeal();
  }, [id]);

  async function loadMeal() {
    try {
      const data = await getMealById(id);
      setMeal(data);
      
      const isFav = await isFavorite(id);
      setFavorite(isFav);
    } catch (error) {
      console.error("Error loading meal:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    try {
      if (favorite) {
        // Remove from favorites
        await removeFavorite(id);
        setFavorite(false);
        Alert.alert(
          "Removed from Favorites",
          `${meal.strMeal} has been removed from your favorites.`,
          [{ text: "OK" }]
        );
      } else {
        // Add to favorites
        await addFavorite(id);
        setFavorite(true);
        Alert.alert(
          "Added to Favorites",
          `${meal.strMeal} has been added to your favorites!`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Could not update favorites. Please try again.");
    }
  }

  function openYoutube() {
    if (meal?.strYoutube) {
      Linking.openURL(meal.strYoutube);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={styles.loadingText}>Loading meal details...</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Meal not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = meal.ingredients ? JSON.parse(meal.ingredients) : [];

  return (
    <ScrollView style={styles.container}>
      {/* Header Image with Favorite Button */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
        
        {/* Favorite Toggle Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
        >
          <Text style={styles.favoriteIcon}>{favorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      {/* Meal Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{meal.strMeal}</Text>
        
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{meal.strCategory}</Text>
          </View>
          {meal.strArea && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>🌍 {meal.strArea}</Text>
            </View>
          )}
        </View>

        {/* Favorite Action Button */}
        <TouchableOpacity
          style={[
            styles.favoriteActionButton,
            favorite && styles.favoriteActionButtonActive
          ]}
          onPress={toggleFavorite}
        >
          <Text style={styles.favoriteActionIcon}>
            {favorite ? "❤️" : "🤍"}
          </Text>
          <Text style={[
            styles.favoriteActionText,
            favorite && styles.favoriteActionTextActive
          ]}>
            {favorite ? "Remove from Favorites" : "Add to Favorites"}
          </Text>
        </TouchableOpacity>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientBullet}>•</Text>
              <Text style={styles.ingredientText}>
                {item.measure} {item.ingredient}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>{meal.strInstructions}</Text>
        </View>

        {/* YouTube Link */}
        {meal.strYoutube && (
          <TouchableOpacity style={styles.youtubeButton} onPress={openYoutube}>
            <Text style={styles.youtubeButtonText}>📺 Watch on YouTube</Text>
          </TouchableOpacity>
        )}

        {/* Tags */}
        {meal.strTags && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Text style={styles.tagsText}>{meal.strTags}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  favoriteIcon: {
    fontSize: 32,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E74C3C',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  favoriteActionButtonActive: {
    backgroundColor: '#E74C3C',
  },
  favoriteActionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  favoriteActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  favoriteActionTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#E74C3C',
    marginRight: 8,
    fontWeight: 'bold',
  },
  ingredientText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  instructionsText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tagsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});