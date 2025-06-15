import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useMovieList } from '../../contexts/MovieListContext';
import { fetchMovieDetails, getImageUrl } from '../../services/api';
import ReviewItem from '../../components/ReviewItem';
import ReviewForm from '../../components/ReviewForm';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

const { width } = Dimensions.get('window');

type MovieDetailProps = {
  route: {
    params: {
      id: number;
      title: string;
    };
  };
  navigation: any;
};

type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

type Review = {
  id: string;
  movieId: number;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const MovieDetailScreen: React.FC<MovieDetailProps> = ({ route, navigation }) => {
  const { id, title } = route.params;
  const { user } = useAuth();
  const {
    favorites,
    watchlist,
    toggleFavorite,
    toggleWatchlist,
    isFavorite,
    isInWatchlist,
    addReview,
    updateReview,
    deleteReview,
    getMovieReviews,
    getUserReview,
  } = useMovieList();

  const [movie, setMovie] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | undefined>(undefined);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadMovieDetails();
    loadAllReviews();
  }, [id]);

  useEffect(() => {
    if (user) {
      const movieReviews = getMovieReviews(id);
      setReviews(movieReviews);
      setUserReview(getUserReview(id));
    }
  }, [user, id, getMovieReviews, getUserReview]);

  const loadAllReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(firestore, 'reviews'),
        where('movieId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setAllReviews(reviewsData);
    } catch (error) {
      console.error('Error loading all reviews:', error);
    }
  };

  const loadMovieDetails = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMovieDetails(id);
      setMovie(data);
      
      // Extract cast from credits
      if (data.credits && data.credits.cast) {
        setCast(data.credits.cast.slice(0, 10)); // Limit to 10 cast members
      }
      
    } catch (error) {
      console.error('Error loading movie details:', error);
      Alert.alert(
        'Hata',
        'Film detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoritePress = async () => {
    if (!user) {
      Alert.alert('Bilgi', 'Favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    if (movie) {
      await toggleFavorite({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      });
    }
  };

  const handleWatchlistPress = async () => {
    if (!user) {
      Alert.alert('Bilgi', 'İzleme listesine eklemek için giriş yapmalısınız.');
      return;
    }

    if (movie) {
      await toggleWatchlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      });
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!user) {
      Alert.alert('Bilgi', 'Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    try {
      await addReview(id, rating, comment);
      setShowReviewForm(false);
      
      // Refresh reviews
      await loadAllReviews();
      const movieReviews = getMovieReviews(id);
      setReviews(movieReviews);
      setUserReview(getUserReview(id));
      
      Alert.alert('Başarılı', 'Yorumunuz başarıyla kaydedildi.');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Hata', 'Yorumunuz kaydedilirken bir hata oluştu.');
    }
  };

  const handleEditReview = () => {
    setIsEditing(true);
    setShowReviewForm(true);
  };

  const handleUpdateReview = async (rating: number, comment: string) => {
    if (!userReview) return;
    
    try {
      await updateReview(userReview.id, rating, comment);
      setShowReviewForm(false);
      setIsEditing(false);
      
      // Refresh reviews
      await loadAllReviews();
      const movieReviews = getMovieReviews(id);
      setReviews(movieReviews);
      setUserReview(getUserReview(id));
      
      Alert.alert('Başarılı', 'Yorumunuz başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert('Hata', 'Yorumunuz güncellenirken bir hata oluştu.');
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    Alert.alert(
      'Onay',
      'Bu yorumu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(userReview.id);
              
              // Refresh reviews
              await loadAllReviews();
              const movieReviews = getMovieReviews(id);
              setReviews(movieReviews);
              setUserReview(undefined);
              
              Alert.alert('Başarılı', 'Yorumunuz başarıyla silindi.');
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Hata', 'Yorumunuz silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Film bilgileri yüklenemedi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMovieDetails}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format the release date
  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString('tr-TR')
    : 'Bilinmiyor';

  return (
    <ScrollView style={styles.container}>
      {/* Movie Poster and Backdrop */}
      <View style={styles.backdropContainer}>
        <Image
          source={{ uri: getImageUrl(movie.backdrop_path, 'w780') }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
        <View style={styles.backdropOverlay} />
      </View>

      <View style={styles.contentContainer}>
        {/* Poster and Basic Info */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            style={styles.posterImage}
            resizeMode="cover"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            <View style={styles.ratingContainer}>
              <AntDesign name="star" size={16} color="#FFC107" />
              <Text style={styles.rating}>
                {movie.vote_average.toFixed(1)} ({movie.vote_count})
              </Text>
            </View>
            <Text style={styles.releaseDate}>Yayın Tarihi: {releaseDate}</Text>
            <Text style={styles.runtime}>
              Süre: {movie.runtime ? `${movie.runtime} dakika` : 'Bilinmiyor'}
            </Text>
            
            {/* Genres */}
            <View style={styles.genresContainer}>
              {movie.genres &&
                movie.genres.map((genre: any) => (
                  <View key={genre.id} style={styles.genreItem}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavoritePress}
          >
            <AntDesign
              name={isFavorite(movie.id) ? 'heart' : 'hearto'}
              size={24}
              color={isFavorite(movie.id) ? '#F44336' : '#333'}
            />
            <Text style={styles.actionButtonText}>Favori</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWatchlistPress}
          >
            <MaterialIcons
              name={isInWatchlist(movie.id) ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isInWatchlist(movie.id) ? '#4CAF50' : '#333'}
            />
            <Text style={styles.actionButtonText}>İzleme Listesi</Text>
          </TouchableOpacity>
          
          {!userReview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowReviewForm(true)}
            >
              <MaterialIcons name="rate-review" size={24} color="#333" />
              <Text style={styles.actionButtonText}>Değerlendir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Overview */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Film Özeti</Text>
          <Text style={styles.overview}>{movie.overview || 'Bu film için özet bilgisi bulunmuyor.'}</Text>
        </View>

        {/* Cast */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Oyuncular</Text>
          <FlatList
            data={cast}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.castItem}>
                <Image
                  source={{
                    uri: item.profile_path
                      ? getImageUrl(item.profile_path, 'w185')
                      : 'https://via.placeholder.com/185x278?text=No+Image',
                  }}
                  style={styles.castImage}
                  resizeMode="cover"
                />
                <Text style={styles.castName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.castCharacter} numberOfLines={1}>
                  {item.character}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.castList}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                Bu film için oyuncu bilgisi bulunmuyor.
              </Text>
            }
          />
        </View>

        {/* User's Review */}
        {userReview && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sizin Yorumunuz</Text>
            <ReviewItem
              id={userReview.id}
              username={userReview.username}
              userId={userReview.userId}
              rating={userReview.rating}
              comment={userReview.comment}
              date={userReview.createdAt}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          </View>
        )}

        {/* Other Reviews */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Kullanıcı Yorumları ({allReviews.filter(r => r.userId !== user?.id).length})
          </Text>
          {allReviews
            .filter(r => r.userId !== user?.id)
            .map((review) => (
              <ReviewItem
                key={review.id}
                id={review.id}
                username={review.username}
                userId={review.userId}
                rating={review.rating}
                comment={review.comment}
                date={review.createdAt}
              />
            ))}
          {allReviews.filter(r => r.userId !== user?.id).length === 0 && (
            <Text style={styles.emptyListText}>
              Bu film için henüz yorum yapılmamış.
            </Text>
          )}
        </View>

        {/* Some space at the bottom */}
        <View style={styles.bottomSpace} />
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Yorumunuzu Düzenleyin' : 'Film Hakkında Yorum Yapın'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowReviewForm(false);
                  setIsEditing(false);
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ReviewForm
              initialRating={isEditing && userReview ? userReview.rating : 0}
              initialComment={isEditing && userReview ? userReview.comment : ''}
              onSubmit={isEditing ? handleUpdateReview : handleSubmitReview}
              onCancel={() => {
                setShowReviewForm(false);
                setIsEditing(false);
              }}
              isEditing={isEditing}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  backdropContainer: {
    position: 'relative',
    height: 200,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: -40,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212121',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  runtime: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreItem: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: '#2196F3',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#757575',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212121',
  },
  overview: {
    fontSize: 15,
    lineHeight: 24,
    color: '#212121',
  },
  castList: {
    paddingVertical: 8,
  },
  castItem: {
    width: 100,
    marginRight: 16,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  castName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  castCharacter: {
    fontSize: 12,
    color: '#757575',
  },
  emptyListText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  bottomSpace: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MovieDetailScreen; 