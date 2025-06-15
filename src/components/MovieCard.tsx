import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { getImageUrl } from '../services/api';

type MovieCardProps = {
  id: number;
  title: string;
  posterPath: string;
  voteAverage: number;
  releaseDate?: string;
  onPress: (id: number) => void;
};

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24; // 2 columns with padding

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  onPress,
}) => {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(id)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(posterPath) }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingContainer}>
          <AntDesign name="star" size={12} color="#FFC107" />
          <Text style={styles.rating}>{voteAverage.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {year ? <Text style={styles.year}>{year}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: cardWidth * 1.5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  year: {
    fontSize: 12,
    color: '#666',
  },
});

export default MovieCard; 