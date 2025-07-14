import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProjects, createProject, deleteProject } from '../api/api';
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

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
        getProjects(user.username).then(data => {
          if (Array.isArray(data)) setProjects(data);
          else setError(data.message || 'Ошибка загрузки проектов');
        });
    }
  }, [user, navigate]);

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;
    setError(null);
    const res = await createProject(newProjectName.trim(), user.username);
    if (res.name) {
      setProjects([...projects, res]);
      setNewProjectName('');
    } else {
      setError(res.message || 'Ошибка создания проекта');
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
    <div className="dashboard">
      <header>
        <h1>Проекты пользователя {user.username} ({user.role})</h1>
        <button onClick={() => logout()}>Выйти</button>
      </header>

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
        {projects.map(p => (
          <li key={p.name}>
            <Link to={`/project/${encodeURIComponent(p.name)}`}>{p.name}</Link>
            {user.role === 'DEVELOPER' && (
              <button onClick={() => onDeleteClick(p)} className="delete-btn">Удалить</button>
            )}
          </li>
        ))}
      </ul>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        visible={modalVisible}
        message={`Вы уверены, что хотите удалить проект "${projectToDelete?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
