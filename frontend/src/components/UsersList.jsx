import React, { useEffect, useState, useContext } from 'react';
import { getUsers, getDoneTasks } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UsersList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchStr, setSearchStr] = useState('');
  const [error, setError] = useState(null);
  const [completedTasksCountByUsername, setCompletedTasksCountByUsername] = useState({});

  if (!user) {
    return <p>Пожалуйста, войдите в систему</p>;
  }

  if (user.role !== 'CLIENT') {
    return (
      <div className="users-list">
        <h2>Доступ запрещён</h2>
        <p>Только клиенты могут просматривать список пользователей</p>
      </div>
    );
  }

  useEffect(() => {
    getUsers()
      .then(data => {
        if (Array.isArray(data)) {
          setAllUsers(data);
          setFilteredUsers(data);
          setError(null);
        } else {
          setError(data.message || 'Ошибка загрузки пользователей');
          setAllUsers([]);
          setFilteredUsers([]);
        }
      })
      .catch(() => {
        setError('Ошибка сети');
        setAllUsers([]);
        setFilteredUsers([]);
      });
  }, []);

  useEffect(() => {
    if (allUsers.length === 0) return;

    const fetchCompletedCount = async (username) => {
      try {
        const tasks = await getDoneTasks(username);
        return Array.isArray(tasks) ? tasks.length : 0;
      } catch {
        return 0;
      }
    };

    Promise.all(allUsers.map(u => fetchCompletedCount(u.username)))
      .then(counts => {
        const countsMap = {};
        allUsers.forEach((u, idx) => {
          countsMap[u.username] = counts[idx];
        });
        setCompletedTasksCountByUsername(countsMap);
      });
  }, [allUsers]);

  useEffect(() => {
    const lowerSearch = searchStr.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.username.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);
  }, [searchStr, allUsers]);

  // Обработчик клика по пользователю — редирект на страницу проектов пользователя
  const handleUserClick = (username) => {
    console.log(username);
    navigate(`/user/${encodeURIComponent(username)}/projects`);
  };

  return (
    <div className="users-list">
      <h2>Пользователи</h2>
      <input
        type="text"
        placeholder="Введите часть имени пользователя"
        value={searchStr}
        onChange={e => setSearchStr(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
      />
      {error && <p className="error">{error}</p>}
      <ul>
        {filteredUsers.map(u => (
          <li
            key={u.id}
            style={{ cursor: 'pointer' }}
            onClick={() => handleUserClick(u.username)}
          >
            <b>{u.username}</b> ({u.userRole}) — Выполнено задач: {completedTasksCountByUsername[u.username] ?? 'загрузка...'}
          </li>
        ))}
      </ul>
    </div>
  );
}