import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

import {
  getTasks,
  createTask,
  deleteTask,
  updateTaskPriority,
  updateTaskEndTime,
} from '../api/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'DONE'];

export default function ProjectPage() {
  const { user } = useContext(AuthContext);
  const { projectName } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('LOW');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // Добавляем состояние для фильтра по дате создания
  const [filterCreatedAfter, setFilterCreatedAfter] = useState('');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, projectName]);

  async function fetchTasks() {
    setError(null);
    const data = await getTasks(user.username, projectName);
    if (Array.isArray(data)) {
      setTasks(data);
    } else {
      setError(data.message || 'Ошибка загрузки задач');
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    setError(null);
    const taskReq = {
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      description: newTaskDescription,
      deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
      username: user.username,
      projectName,
    };
    const res = await createTask(taskReq);
    if (res.id) {
      setTasks([...tasks, res]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDeadline('');
      setNewTaskPriority('LOW');
    } else {
      setError(res.message || 'Ошибка создания задачи');
    }
  };

  const onDeleteClick = (task) => {
    setTaskToDelete(task);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    setModalVisible(false);
    if (!taskToDelete) return;

    deleteTask(taskToDelete.title, projectName, user.username)
      .then((res) => {
        if (res === taskToDelete.title || res.deletedTitle === taskToDelete.title || res.success) {
          setTasks(tasks.filter((t) => t.title !== taskToDelete.title));
          setNotification(`Задача "${taskToDelete.title}" успешно удалена`);
          setError(null);
        } else {
          setError(res.message || 'Ошибка удаления задачи');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Ошибка сети или сервера при удалении задачи');
      })
      .finally(() => {
        setTaskToDelete(null);
      });
  };

  const cancelDelete = () => {
    setModalVisible(false);
    setTaskToDelete(null);
  };

  const handleUpdatePriority = async (title, newPriority) => {
    const taskReq = { title, priority: newPriority, username: user.username, projectName };
    const res = await updateTaskPriority(taskReq);
    if (res === newPriority) {
      setTasks(tasks.map((t) => (t.title === title ? { ...t, priority: newPriority, endTime: null } : t)));
    } else {
      setError(res.message || 'Ошибка обновления приоритета');
    }
  };

  const handleUpdateEndTime = async (title, newEndTime) => {
    const taskReq = { title, endTime: newEndTime, username: user.username, projectName };
    const res = await updateTaskEndTime(taskReq);
    if (res === newEndTime) {
      setTasks(tasks.map((t) => (t.title === title ? { ...t, endTime: newEndTime } : t)));
    } else {
      setError(res.message || 'Ошибка обновления времени завершения');
    }
  };

  // Фильтруем задачи по дате создания, если фильтр установлен
  const filterDate = filterCreatedAfter ? new Date(filterCreatedAfter) : null;
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

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const draggedTask = tasks.find((t) => t.id.toString() === draggableId);
    if (!draggedTask) return;

    const destPriority = destination.droppableId.toUpperCase();

    try {
      if (destPriority === 'DONE' && !draggedTask.endTime) {
        // Перемещение в DONE — ставим текущую дату и время завершения
        const nowISO = new Date().toISOString();
        await handleUpdateEndTime(draggedTask.title, nowISO);
        draggedTask.endTime = nowISO;
        draggedTask.priority = destPriority;
      } else if (destPriority !== 'DONE') {
        // Перемещение в приоритет — обновляем priority и сбрасываем endTime
        await handleUpdatePriority(draggedTask.title, destPriority);
        draggedTask.priority = destPriority;
        draggedTask.endTime = null;
      }
    } catch {
      setError('Ошибка при обновлении задачи');
      fetchTasks();
      return;
    }

    // Обновляем локально порядок в колонках
    const newTasksByPriority = { ...tasksByPriority };

    // Удаляем из старой колонки
    newTasksByPriority[source.droppableId.toUpperCase()] = Array.from(
      newTasksByPriority[source.droppableId.toUpperCase()]
    );
    newTasksByPriority[source.droppableId.toUpperCase()].splice(source.index, 1);

    // Вставляем в новую колонку
    newTasksByPriority[destPriority] = Array.from(newTasksByPriority[destPriority]);
    newTasksByPriority[destPriority].splice(destination.index, 0, draggedTask);

    // Обновляем состояние задач
    setTasks(Object.values(newTasksByPriority).flat());
  };

  // Навигация по задаче
  const onTaskClick = (task) => {
    navigate(`/project/${encodeURIComponent(projectName)}/task/${task.id}`);
  };

  const TaskCard = ({ task, index }) => (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task-card priority-${task.priority.toLowerCase()} ${
            snapshot.isDragging ? 'dragging' : ''
          } ${task.priority === 'DONE' ? 'done-task' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onTaskClick(task)}
          style={{
            userSelect: 'none',
            ...provided.draggableProps.style,
          }}
        >
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <p><b>Приоритет:</b> {task.priority}</p>
          <p><b>Начало:</b> {task.startTime ? new Date(task.startTime).toLocaleString() : 'не указано'}</p>
          <p><b>Дедлайн:</b> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'не указан'}</p>
          {task.endTime && <p><b>Завершено:</b> {new Date(task.endTime).toLocaleString()}</p>}
          {task.priority !== 'DONE' && user.role === 'DEVELOPER' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(task);
              }}
              className="delete-btn"
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </Draggable>
  );

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

      {notification && (
        <div className="notification">
          {notification}
          <button onClick={() => setNotification(null)} className="close-notification">×</button>
        </div>
      )}

      {user.role === 'DEVELOPER' && (
        <section className="create-task">
          <h3>Создать задачу</h3>
          <input
            placeholder="Название задачи"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <textarea
            placeholder="Описание"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <input
            type="datetime-local"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
          >
            {PRIORITIES.filter(p => p !== 'DONE').map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button onClick={handleCreateTask}>Создать</button>
        </section>
      )}

      {error && <p className="error">{error}</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="tasks-columns-wrapper">
          <div className="tasks-columns">
            {PRIORITIES.map((priority) => (
              <Droppable droppableId={priority.toLowerCase()} key={priority}>
                {(provided) => (
                  <div
                    className={`tasks-column priority-${priority.toLowerCase()}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3>{priority === 'DONE' ? 'Выполнено (DONE)' : priority}</h3>
                    {tasksByPriority[priority].length === 0 && <p>Нет задач</p>}
                    {tasksByPriority[priority].map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      <ConfirmModal
        visible={modalVisible}
        message={`Вы уверены, что хотите удалить задачу "${taskToDelete?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
