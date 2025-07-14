import React, { useEffect, useState } from 'react';
import { getProjects } from '../api/api';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function UserProjectsView() {
  const { username } = useParams();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(username);
    if (username) {
      getProjects(username)
        .then(data => {
          if (Array.isArray(data)) setProjects(data);
          else setError(data.message || 'Ошибка загрузки проектов');
        })
        .catch(() => setError('Ошибка сети'));
    }
  }, [username]);

  return (
    <div className="dashboard">
      <header>
        <h1>Проекты пользователя {username}</h1>
        <button onClick={() => navigate(-1)}>Назад</button>
      </header>

      {error && <p className="error">{error}</p>}

      <ul className="project-list">
        {projects.length === 0 && <p>Нет проектов</p>}
        {projects.map(p => (
            <li key={p.name}>
                <Link to={`/user/${encodeURIComponent(username)}/project/${encodeURIComponent(p.name)}`}>
                {p.name}
                </Link>
            </li>
            ))}
      </ul>
    </div>
  );
}