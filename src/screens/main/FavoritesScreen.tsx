import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMovieList } from '../../contexts/MovieListContext';
import MovieCard from '../../components/MovieCard';

type FavoritesScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type TabType = 'favorites' | 'watchlist';

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { favorites, watchlist } = useMovieList();
  const [activeTab, setActiveTab] = useState<TabType>('favorites');

  const handleMoviePress = (movieId: number) => {
    // Find the movie to get its title
    const movies = activeTab === 'favorites' ? favorites : watchlist;
    const movie = movies.find((m) => m.id === movieId);
    
    if (movie) {
      navigation.navigate('MovieDetail', { id: movieId, title: movie.title });
    }
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        {activeTab === 'favorites' ? (
          <>
            <AntDesign name="heart" size={64} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>Favori film bulunamadı</Text>
            <Text style={styles.emptyStateSubtext}>
              Filmleri favori listenize eklemek için film detay sayfasındaki kalp simgesine dokunun
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons name="bookmark" size={64} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>İzleme listenizde film yok</Text>
            <Text style={styles.emptyStateSubtext}>
              Filmleri izleme listenize eklemek için film detay sayfasındaki yer işareti simgesine dokunun
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === 'favorites' ? 'Favori Filmlerim' : 'İzleme Listem'}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <AntDesign
            name="heart"
            size={16}
            color={activeTab === 'favorites' ? '#F44336' : '#757575'}
          />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorilerim
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'watchlist' && styles.activeTab]}
          onPress={() => setActiveTab('watchlist')}
        >
          <MaterialIcons
            name="bookmark"
            size={16}
            color={activeTab === 'watchlist' ? '#4CAF50' : '#757575'}
          />
          <Text style={[styles.tabText, activeTab === 'watchlist' && styles.activeTabText]}>
            İzleme Listem
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'favorites' ? favorites : watchlist}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <MovieCard
            id={item.id}
            title={item.title}
            posterPath={item.poster_path}
            voteAverage={item.vote_average}
            releaseDate={item.release_date}
            onPress={handleMoviePress}
          />
        )}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#2196F3',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FavoritesScreen; 