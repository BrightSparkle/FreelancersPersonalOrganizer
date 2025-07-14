import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTasks, getComments } from '../api/api';
import CommentSection from './CommentSection';

export default function TaskCommentsPage() {
  const { user } = useContext(AuthContext);
  const { projectName, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTaskAndComments() {
      try {
        const tasks = await getTasks(user.username, projectName);
        const currentTask = tasks.find((t) => t.id.toString() === taskId);
        if (!currentTask) {
          setError('Задача не найдена');
          return;
        }
        setTask(currentTask);

        const commentsData = await getComments(taskId);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch {
        setError('Ошибка загрузки данных');
      }
    }
    fetchTaskAndComments();
  }, [user, projectName, taskId]);

  if (error) return <p className="error">{error}</p>;
  if (!task) return <p>Загрузка задачи...</p>;

  return (
    <div className="task-comments-page">
      <header>
        <h1>Задача: {task.title}</h1>
        <button onClick={() => navigate(-1)}>Назад к проекту</button>
      </header>

      <div className="task-details">
        <p><b>Описание:</b> {task.description}</p>
        <p><b>Приоритет:</b> {task.priority}</p>
        <p><b>Начало:</b> {task.startTime ? new Date(task.startTime).toLocaleString() : 'не указано'}</p>
        <p><b>Дедлайн:</b> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'не указан'}</p>
        {task.endTime && <p><b>Завершено:</b> {new Date(task.endTime).toLocaleString()}</p>}
      </div>

      <CommentSection taskId={task.id} user={user} />
    </div>
  );
}
