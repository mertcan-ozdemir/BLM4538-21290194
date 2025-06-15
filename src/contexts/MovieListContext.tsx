import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { firestore } from '../firebase/config';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
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

type MovieListContextData = {
  favorites: Movie[];
  watchlist: Movie[];
  reviews: Review[];
  toggleFavorite: (movie: Movie) => Promise<void>;
  toggleWatchlist: (movie: Movie) => Promise<void>;
  isFavorite: (movieId: number) => boolean;
  isInWatchlist: (movieId: number) => boolean;
  addReview: (movieId: number, rating: number, comment: string) => Promise<void>;
  updateReview: (reviewId: string, rating: number, comment: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getMovieReviews: (movieId: number) => Review[];
  getUserReview: (movieId: number) => Review | undefined;
};

type MovieListProviderProps = {
  children: ReactNode;
};

const MovieListContext = createContext<MovieListContextData>({} as MovieListContextData);

export const MovieListProvider: React.FC<MovieListProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Reset data when user logs out
      setFavorites([]);
      setWatchlist([]);
      setReviews([]);
    }
  }, [user]);

  async function loadData() {
    try {
      if (!user) return;

      // Favorileri yükle
      const favoritesQuery = query(
        collection(firestore, 'favorites'),
        where('userId', '==', user.id)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesData = favoritesSnapshot.docs.map(doc => doc.data() as Movie);
      setFavorites(favoritesData);

      // İzleme listesini yükle
      const watchlistQuery = query(
        collection(firestore, 'watchlist'),
        where('userId', '==', user.id)
      );
      const watchlistSnapshot = await getDocs(watchlistQuery);
      const watchlistData = watchlistSnapshot.docs.map(doc => doc.data() as Movie);
      setWatchlist(watchlistData);

      // Yorumları yükle
      const reviewsQuery = query(
        collection(firestore, 'reviews'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Review));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async function toggleFavorite(movie: Movie): Promise<void> {
    try {
      if (!user) return;

      const isFav = favorites.some(item => item.id === movie.id);
      const favoriteRef = doc(firestore, 'favorites', `${user.id}_${movie.id}`);

      if (isFav) {
        // Favorilerden kaldır
        await deleteDoc(favoriteRef);
        setFavorites(favorites.filter(item => item.id !== movie.id));
      } else {
        // Favorilere ekle
        await setDoc(favoriteRef, {
          ...movie,
          userId: user.id,
          addedAt: serverTimestamp()
        });
        setFavorites([...favorites, movie]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  async function toggleWatchlist(movie: Movie): Promise<void> {
    try {
      if (!user) return;

      const isInList = watchlist.some(item => item.id === movie.id);
      const watchlistRef = doc(firestore, 'watchlist', `${user.id}_${movie.id}`);

      if (isInList) {
        // İzleme listesinden kaldır
        await deleteDoc(watchlistRef);
        setWatchlist(watchlist.filter(item => item.id !== movie.id));
      } else {
        // İzleme listesine ekle
        await setDoc(watchlistRef, {
          ...movie,
          userId: user.id,
          addedAt: serverTimestamp()
        });
        setWatchlist([...watchlist, movie]);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  }

  function isFavorite(movieId: number): boolean {
    return favorites.some(item => item.id === movieId);
  }

  function isInWatchlist(movieId: number): boolean {
    return watchlist.some(item => item.id === movieId);
  }

  async function addReview(movieId: number, rating: number, comment: string): Promise<void> {
    try {
      if (!user) return;

      // Check if user already has a review for this movie
      const existingReview = reviews.find(r => r.movieId === movieId && r.userId === user.id);
      
      if (existingReview) {
        // Update existing review
        return updateReview(existingReview.id, rating, comment);
      }

      // Yeni yorum oluştur
      const reviewRef = doc(collection(firestore, 'reviews'));
      const newReview: Review = {
        id: reviewRef.id,
        movieId,
        userId: user.id,
        username: user.username,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      await setDoc(reviewRef, newReview);
      setReviews([newReview, ...reviews]);
    } catch (error) {
      console.error('Error adding review:', error);
    }
  }

  async function updateReview(reviewId: string, rating: number, comment: string): Promise<void> {
    try {
      if (!user) return;

      const reviewRef = doc(firestore, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        rating,
        comment,
        updatedAt: serverTimestamp()
      });

      // Yerel state'i güncelle
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            rating,
            comment
          };
        }
        return review;
      }));
    } catch (error) {
      console.error('Error updating review:', error);
    }
  }

  async function deleteReview(reviewId: string): Promise<void> {
    try {
      if (!user) return;

      const reviewRef = doc(firestore, 'reviews', reviewId);
      await deleteDoc(reviewRef);

      // Yerel state'ten kaldır
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  }

  function getMovieReviews(movieId: number): Review[] {
    return reviews.filter(review => review.movieId === movieId);
  }

  function getUserReview(movieId: number): Review | undefined {
    if (!user) return undefined;
    return reviews.find(review => review.movieId === movieId && review.userId === user.id);
  }

  return (
    <MovieListContext.Provider
      value={{
        favorites,
        watchlist,
        reviews,
        toggleFavorite,
        toggleWatchlist,
        isFavorite,
        isInWatchlist,
        addReview,
        updateReview,
        deleteReview,
        getMovieReviews,
        getUserReview,
      }}
    >
      {children}
    </MovieListContext.Provider>
  );
};

export function useMovieList(): MovieListContextData {
  const context = useContext(MovieListContext);

  if (!context) {
    throw new Error('useMovieList must be used within a MovieListProvider');
  }

  return context;
} 