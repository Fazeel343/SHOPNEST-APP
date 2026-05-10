function getToken() {
  return localStorage.getItem('shopnest_token');
}

function getUser() {
  const u = localStorage.getItem('shopnest_user');
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem('shopnest_token');
  localStorage.removeItem('shopnest_user');
  location.href = '/login.html';
}

function requireLogin() {
  if (!getToken()) location.href = '/login.html';
}

function requireAdmin() {
  const u = getUser();
  if (!u || u.role !== 'admin') location.href = '/login.html';
}

function updateNav() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  if (user) {
    navAuth.textContent = 'Logout';
    navAuth.onclick = logout;
  } else {
    navAuth.textContent = 'Login';
    navAuth.href = '/login.html';
  }
}