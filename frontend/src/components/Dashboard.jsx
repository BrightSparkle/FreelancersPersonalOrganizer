import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProjects, createProject, deleteProject, getTasks } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState(null);

  // Для модалки подтверждения удаления
  const [modalVisible, setModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Для проектов с дедлайнами сегодня
  const [projectsWithDeadlineToday, setProjectsWithDeadlineToday] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProjectsAndCheckDeadlines();
    }
  }, [user]);

  // Загрузка проектов и проверка задач с дедлайном сегодня
  async function loadProjectsAndCheckDeadlines() {
    try {
      const projectsData = await getProjects(user.username);
      if (!Array.isArray(projectsData)) {
        setError(projectsData.message || 'Ошибка загрузки проектов');
        return;
      }
      setProjects(projectsData);

      const deadlineProjectsSet = new Set();
      const today = new Date();

      await Promise.all(
        projectsData.map(async (project) => {
          const tasks = await getTasks(user.username, project.name);
          if (Array.isArray(tasks)) {
            const hasDeadlineToday = tasks.some(task => {
              if (!task.deadline) return false;
              if (task.endTime) return false; // задача завершена
              const dl = new Date(task.deadline);
              return (
                dl.getFullYear() === today.getFullYear() &&
                dl.getMonth() === today.getMonth() &&
                dl.getDate() === today.getDate()
              );
            });
            if (hasDeadlineToday) {
              deadlineProjectsSet.add(project.name);
            }
          }
        })
      );

      setProjectsWithDeadlineToday(deadlineProjectsSet);
    } catch (e) {
      setError('Ошибка сети при загрузке проектов');
    }
  }

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setError(null);
    try {
      const res = await createProject(newProjectName.trim(), user.username);
      if (res.name) {
        setProjects([...projects, res]);
        setNewProjectName('');
        // Обновим дедлайны после создания нового проекта
        loadProjectsAndCheckDeadlines();
      } else {
        setError(res.message || 'Ошибка создания проекта');
      }
    } catch {
      setError('Ошибка сети при создании проекта');
    }
  };

  // Открыть модалку при клике "Удалить"
  const onDeleteClick = (project) => {
    setProjectToDelete(project);
    setModalVisible(true);
  };

  // Подтвердить удаление
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setModalVisible(false);
    setError(null);
    try {
      const res = await deleteProject(projectToDelete.name, user.username);
      if (res.name) {
        setProjects(projects.filter(p => p.name !== projectToDelete.name));
        // Обновим дедлайны после удаления проекта
        loadProjectsAndCheckDeadlines();
      } else {
        setError(res.message || 'Ошибка удаления проекта');
      }
    } catch (err) {
      setError('Ошибка сети или сервера при удалении проекта');
    } finally {
      setProjectToDelete(null);
    }
  };

  // Отмена удаления
  const cancelDelete = () => {
    setModalVisible(false);
    setProjectToDelete(null);
  };

  // Если клиент, то компонент не рендерится (редирект уже выполнен)
  if (user?.role === 'CLIENT') {
    return null;
  }

  return (
    <div className="dashboard" style={{ position: 'relative' }}>
      <header>
        <h1>Проекты пользователя {user.username} ({user.role})</h1>
        <button onClick={() => logout()}>Выйти</button>
      </header>

      {/* Уведомление справа сверху */}
      {projectsWithDeadlineToday.size > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            backgroundColor: '#ffdddd',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(255,0,0,0.5)',
            zIndex: 1000,
            fontWeight: 'bold',
            color: '#b00000',
          }}
        >
          Внимание! Есть задачи с дедлайном сегодня в {projectsWithDeadlineToday.size} проект{projectsWithDeadlineToday.size > 1 ? 'ах' : 'е'} 🔥
        </div>
      )}

      {user.role === 'DEVELOPER' && (
        <div className="create-project">
          <input
            placeholder="Название нового проекта"
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
          />
          <button onClick={handleCreate}>Создать проект</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <ul className="project-list">
        {projects.map(p => {
          const hasDeadline = projectsWithDeadlineToday.has(p.name);
          return (
            <li key={p.name} style={{ position: 'relative' }}>
              <Link to={`/project/${encodeURIComponent(p.name)}`}>
                {p.name}
                {hasDeadline && (
                  <span title="Есть задачи с дедлайном сегодня" style={{ color: 'red', marginLeft: 6, fontWeight: 'bold' }}>
                    🔥
                  </span>
                )}
              </Link>
              {user.role === 'DEVELOPER' && (
                <button onClick={() => onDeleteClick(p)} className="delete-btn">Удалить</button>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmModal
        visible={modalVisible}
        message={`Вы уверены, что хотите удалить проект "${projectToDelete?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}