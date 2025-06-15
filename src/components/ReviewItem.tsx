import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

type ReviewItemProps = {
  id: string;
  username: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

const ReviewItem: React.FC<ReviewItemProps> = ({
  id,
  username,
  userId,
  rating,
  comment,
  date,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === userId;
  const formattedDate = new Date(date).toLocaleDateString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AntDesign
                key={star}
                name="star"
                size={16}
                color={star <= rating ? '#FFC107' : '#E0E0E0'}
              />
            ))}
          </View>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={styles.comment}>{comment}</Text>
      {isCurrentUser && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <MaterialIcons name="edit" size={18} color="#2196F3" />
            <Text style={[styles.actionText, { color: '#2196F3' }]}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <MaterialIcons name="delete" size={18} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Sil</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default ReviewItem; 