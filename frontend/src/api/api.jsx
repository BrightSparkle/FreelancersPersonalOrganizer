const API_BASE = 'http://localhost:8080/api';

export async function signIn(username, password) {
  const res = await fetch(`${API_BASE}/user/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function signUp(username, email, password, role) {
  const res = await fetch(`${API_BASE}/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role }),
  });
  console.log(username, email, password, role );
  return res.json();
}

export async function getProjects(username) {
  const res = await fetch(`${API_BASE}/project/getAll?username=${encodeURIComponent(username)}`);
  return res.json();
}

export async function createProject(name, username) {
  const res = await fetch(`${API_BASE}/project/developer/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username }),
  });
  return res.json();
}

export async function deleteProject(name, username) {
  const res = await fetch(`${API_BASE}/project/developer/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username }),
  });
  return res.json();
}

export async function getTasks(username, projectName) {
  const res = await fetch(`${API_BASE}/task/getAll?username=${encodeURIComponent(username)}&projectName=${encodeURIComponent(projectName)}`);
  return res.json();
}

export async function getTaskById(taskId) {
  const res = await fetch(`${API_BASE}/task/getTask?taskId=${taskId}`);
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${API_BASE}/task/developer/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function getDoneTasks(username) {
  const url = new URL(`${API_BASE}/task/getAllDone`);
  url.searchParams.append('username', username);
  const res = await fetch(url);
  return res.json();
}

export async function deleteTask(title, projectName, username) {
  const url = new URL(`${API_BASE}/task/developer/delete`);
  url.searchParams.append('title', title);
  url.searchParams.append('projectName', projectName);
  url.searchParams.append('username', username);
  const res = await fetch(url, { method: 'DELETE' });
  return res.json();
}

export async function updateTaskPriority(taskRequest) {
  const res = await fetch(`${API_BASE}/task/developer/update/priority`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskRequest),
  });
  return res.json();
}

export async function updateTaskEndTime(taskRequest) {
  const res = await fetch(`${API_BASE}/task/developer/update/endtime`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskRequest),
  });
  return res.json();
}

export async function getUsers() {
  const url = new URL(`${API_BASE}/user/getAll`);
  const res = await fetch(url);
  return res.json();
}

export async function getComments(taskId) {
  const res = await fetch(`${API_BASE}/comment/getAll?taskId=${taskId}`);
  return res.json();
}

export async function createComment(commentRequest) {
  const res = await fetch(`${API_BASE}/comment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentRequest),
  });
  return res.json();
}

export async function deleteComment(commentId, username) {
  const url = new URL(`${API_BASE}/comment/delete`);
  url.searchParams.append('commentId', commentId);
  url.searchParams.append('username', username);
  const res = await fetch(url, { method: 'DELETE' });
  return res.json();
}