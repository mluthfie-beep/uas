const AUTH_DB_KEY = 'vgsUsersDB';       
const AUTH_SESSION_KEY = 'vgsCurrentUser'; 

const AUTH_PROTECTED_PAGES = ['beranda.html', 'jadwal.html', 'pembayaran.html', 'profil.html'];

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_DB_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_DB_KEY, JSON.stringify(users));
}

function cariUser(usernameOrEmail) {
  if (!usernameOrEmail) return null;
  const key = usernameOrEmail.trim().toLowerCase();
  return getUsers().find(u => u.username.toLowerCase() === key) || null;
}

function ambilInisial(nama) {
  const kata = (nama || '').trim().split(/\s+/);
  const inisial = kata.slice(0, 2).map(k => k[0] || '').join('');
  return inisial.toUpperCase() || '?';
}

/* ---------- Pendaftaran ---------- */
function daftarkanUser({ nama, username, password, telepon }) {
  nama = (nama || '').trim();
  username = (username || '').trim();
  telepon = (telepon || '').trim();

  if (!nama || !username || !password) {
    return { sukses: false, pesan: 'Semua field wajib diisi.' };
  }
  if (cariUser(username)) {
    return { sukses: false, pesan: 'Username/email ini sudah terdaftar. Silakan masuk atau gunakan yang lain.' };
  }

  const userBaru = {
    nama,
    username,
    password,
    telepon,
    bergabung: new Date().toISOString()
  };

  const users = getUsers();
  users.push(userBaru);
  saveUsers(users);
  setSesiAktif(username);

  return { sukses: true, user: userBaru };
}

/* ---------- Login ---------- */
function loginUser(username, password) {
  const user = cariUser(username);
  if (!user) {
    return { sukses: false, pesan: 'Akun belum terdaftar. Silakan daftar terlebih dahulu.' };
  }
  if (user.password !== password) {
    return { sukses: false, pesan: 'Password salah. Silakan coba lagi.' };
  }
  setSesiAktif(user.username);
  return { sukses: true, user };
}

/* ---------- Sesi ---------- */
function setSesiAktif(username) {
  localStorage.setItem(AUTH_SESSION_KEY, username);
}

function getUserAktif() {
  const username = localStorage.getItem(AUTH_SESSION_KEY);
  if (!username) return null;
  return cariUser(username);
}

function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function requireAuth(redirectTo) {
  redirectTo = redirectTo || 'login.html';
  const user = getUserAktif();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

function updateUserAktif(dataBaru) {
  const usernameLama = localStorage.getItem(AUTH_SESSION_KEY);
  if (!usernameLama) return false;

  const users = getUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === usernameLama.toLowerCase());
  if (idx === -1) return false;

  users[idx] = Object.assign({}, users[idx], dataBaru);
  saveUsers(users);

  if (dataBaru.username && dataBaru.username.toLowerCase() !== usernameLama.toLowerCase()) {
    setSesiAktif(dataBaru.username);
  }
  return true;
}

function terapkanNavUser(user) {
  const inisial = ambilInisial(user.nama);
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText('navUserName', user.nama);
  setText('navUserInitials', inisial);
  setText('sidebarUserName', user.nama);
  setText('sidebarUserInitials', inisial);
}

document.addEventListener('DOMContentLoaded', function () {
  const user = getUserAktif();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (AUTH_PROTECTED_PAGES.includes(currentPage) && !user) {
    window.location.href = 'login.html';
    return;
  }

  const navGuest = document.getElementById('navAuthGuest');
  const navUser = document.getElementById('navAuthUser');
  const sbGuest = document.getElementById('sidebarProfileGuest');
  const sbUser = document.getElementById('sidebarProfileUser');
  const guestBadgeWrap = document.getElementById('guestBadgeWrap');

  if (user) {
    if (navGuest) navGuest.classList.add('d-none');
    if (navUser) navUser.classList.remove('d-none');
    if (sbGuest) sbGuest.classList.add('d-none');
    if (sbUser) sbUser.classList.remove('d-none');
    if (guestBadgeWrap) guestBadgeWrap.classList.add('d-none');
    terapkanNavUser(user);
  } else {
    if (navGuest) navGuest.classList.remove('d-none');
    if (navUser) navUser.classList.add('d-none');
    if (sbGuest) sbGuest.classList.remove('d-none');
    if (sbUser) sbUser.classList.add('d-none');
  }

  ['logoutBtn', 'sidebarLogoutBtn', 'navLogoutBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        logoutUser();
        window.location.href = 'index.html';
      });
    }
  });
});
