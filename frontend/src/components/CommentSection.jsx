import React, { useEffect, useState } from 'react';
import { getComments, createComment, deleteComment } from '../api/api';
import ConfirmModal from './ConfirmModal';

export default function CommentSection({ taskId, user }) {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState(null);

  // Состояния для модального окна подтверждения удаления
  const [modalVisible, setModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  async function fetchComments() {
    setError(null); // Сброс ошибки перед загрузкой
    const data = await getComments(taskId);
    if (Array.isArray(data)) {
      setComments(data);
    } else {
      setError(data.message || 'Ошибка загрузки комментариев');
    }
  }

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      setError('Комментарий не может быть пустым.');
      return;
    }
    setError(null); // Сброс ошибки перед добавлением
    const commentReq = {
      text: newCommentText.trim(),
      taskId,
      author: user.username,
    };
    try {
      const res = await createComment(commentReq);
      if (res.id) {
        setComments([...comments, res]);
        setNewCommentText('');
      } else {
        setError(res.message || 'Ошибка добавления комментария');
      }
    } catch {
      setError('Ошибка сети при добавлении комментария.');
    }
  };

  // Открыть модалку подтверждения удаления комментария
  const onDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setModalVisible(true);
  };

  // Подтвердить удаление комментария
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setModalVisible(false);
    setError(null);
    try {
      const res = await deleteComment(commentToDelete.id, user.username);
      if (res.comment === 'комментарий удален') {
        setComments(comments.filter(c => c.id !== commentToDelete.id));
      } else {
        setError(res.message || 'Ошибка удаления комментария');
      }
    } catch {
      setError('Ошибка сети или сервера при удалении комментария.');
    } finally {
      setCommentToDelete(null);
    }
  };

  // Отмена удаления комментария
  const cancelDeleteComment = () => {
    setModalVisible(false);
    setCommentToDelete(null);
  };

  return (
    <div className="comment-section">
      <h5>Комментарии</h5>
      {error && <p className="error">{error}</p>}
      <ul>
        {comments.map(c => (
          <li key={c.id}>
            <b>{c.author}</b>
            <span className="comment-text">: {c.text}</span>
            <small>({new Date(c.createdAt).toLocaleString()})</small>
            {c.author === user.username && (
              <button onClick={() => onDeleteClick(c)} className="delete-btn">X</button>
            )}
          </li>
        ))}
      </ul>
      <textarea
        placeholder="Написать комментарий..."
        value={newCommentText}
        onChange={e => setNewCommentText(e.target.value)}
      />
      <button onClick={handleAddComment}>Добавить комментарий</button>

      <ConfirmModal
        visible={modalVisible}
        message={`Вы уверены, что хотите удалить комментарий "${commentToDelete?.text}"?`}
        onConfirm={confirmDeleteComment}
        onCancel={cancelDeleteComment}
      />
    </div>
  );
}
