import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

type ReviewFormProps = {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => void;
  onCancel?: () => void;
  isEditing?: boolean;
};

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = () => {
    if (rating === 0) {
      // Show an error or alert that rating is required
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? 'Yorumunuzu Düzenleyin' : 'Film Hakkında Yorum Yapın'}
      </Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Puanınız:</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <AntDesign
                name="star"
                size={30}
                color={star <= rating ? '#FFC107' : '#E0E0E0'}
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.commentContainer}>
        <Text style={styles.label}>Yorumunuz:</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Bu film hakkında düşüncelerinizi yazın..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.submitButton, rating === 0 && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Güncelle' : 'Gönder'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 8,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
  },
});

export default ReviewForm; 