import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTasks } from '../api/api';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'DONE'];

export default function ProjectPageViewClient() {
  const { user } = useContext(AuthContext);
  const { username, projectName } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  // Состояние фильтра по дате создания
  const [filterCreatedAfter, setFilterCreatedAfter] = useState('');

  useEffect(() => {
    if (user && username) {
      fetchTasks();
    }
  }, [user, username, projectName]);

  async function fetchTasks() {
    setError(null);
    try {
      const data = await getTasks(username, projectName);
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setError(data.message || 'Ошибка загрузки задач');
      }
    } catch {
      setError('Ошибка сети при загрузке задач');
    }
  }

  // Преобразуем filterCreatedAfter в дату для сравнения
  const filterDate = filterCreatedAfter ? new Date(filterCreatedAfter) : null;

  // Фильтруем задачи по дате создания (startTime)
  const filteredTasks = filterDate
    ? tasks.filter(task => new Date(task.startTime) > filterDate)
    : tasks;

  // Группируем отфильтрованные задачи по приоритетам и DONE
  const tasksByPriority = { LOW: [], MEDIUM: [], HIGH: [], DONE: [] };
  filteredTasks.forEach((task) => {
    if (task.endTime) {
      tasksByPriority.DONE.push(task);
    } else if (tasksByPriority[task.priority]) {
      tasksByPriority[task.priority].push(task);
    }
  });

  const onTaskClick = (task) => {
    navigate(`/project/${encodeURIComponent(projectName)}/task/${task.id}`);
  };

  return (
    <div className="project-page">
      <header>
        <h1>Проект: {projectName}</h1>
        <button onClick={() => navigate(-1)}>Назад</button>
      </header>

      {/* Фильтр по дате создания задач */}
      <section className="filter-created-after" style={{ marginBottom: '1rem' }}>
        <label>
          Показать задачи, созданные после:&nbsp;
          <input
            type="date"
            value={filterCreatedAfter}
            onChange={(e) => setFilterCreatedAfter(e.target.value)}
          />
        </label>
      </section>

      {error && <p className="error">{error}</p>}

      <div className="tasks-columns-wrapper">
        <div className="tasks-columns">
          {PRIORITIES.map((priority) => (
            <div
              className={`tasks-column priority-${priority.toLowerCase()}`}
              key={priority}
            >
              <h3>{priority === 'DONE' ? 'Выполнено (DONE)' : priority}</h3>
              {tasksByPriority[priority].length === 0 && <p>Нет задач</p>}
              {tasksByPriority[priority].map((task) => (
                <div
                  key={task.id}
                  className={`task-card priority-${task.priority.toLowerCase()} ${
                    task.priority === 'DONE' ? 'done-task' : ''
                  }`}
                  onClick={() => onTaskClick(task)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p><b>Приоритет:</b> {task.priority}</p>
                  <p><b>Начало:</b> {task.startTime ? new Date(task.startTime).toLocaleString() : 'не указано'}</p>
                  <p><b>Дедлайн:</b> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'не указан'}</p>
                  {task.endTime && <p><b>Завершено:</b> {new Date(task.endTime).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
