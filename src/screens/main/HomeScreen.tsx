import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import MovieSection from '../../components/MovieSection';
import { 
  fetchTrendingMovies, 
  fetchPopularMovies, 
  fetchTopRatedMovies 
} from '../../services/api';

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const [trending, popular, topRated] = await Promise.all([
        fetchTrendingMovies(),
        fetchPopularMovies(),
        fetchTopRatedMovies(),
      ]);

      setTrendingMovies(trending);
      setPopularMovies(popular);
      setTopRatedMovies(topRated);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMovies();
  };

  const handleMoviePress = (movieId: number, title: string) => {
    navigation.navigate('MovieDetail', { id: movieId, title });
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.title}>Movie App</Text>
        <Text style={styles.greeting}>Merhaba, {user?.username || 'Misafir'}</Text>
      </View>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <MovieSection
          title="Trendler"
          movies={trendingMovies}
          isLoading={isLoading}
          onMoviePress={(id) => {
            const movie = trendingMovies.find((m) => m.id === id);
            if (movie) {
              handleMoviePress(id, movie.title);
            }
          }}
        />
        
        <MovieSection
          title="Popüler Filmler"
          movies={popularMovies}
          isLoading={isLoading}
          onMoviePress={(id) => {
            const movie = popularMovies.find((m) => m.id === id);
            if (movie) {
              handleMoviePress(id, movie.title);
            }
          }}
        />
        
        <MovieSection
          title="En İyi Filmler"
          movies={topRatedMovies}
          isLoading={isLoading}
          onMoviePress={(id) => {
            const movie = topRatedMovies.find((m) => m.id === id);
            if (movie) {
              handleMoviePress(id, movie.title);
            }
          }}
        />
        
        {/* Add some space at the bottom */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  greeting: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
  bottomSpace: {
    height: 20,
  },
});

export default HomeScreen; 