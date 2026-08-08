// PASSCODE comes from js/config.js (generated from .env, gitignored)

const pinForm = document.getElementById('pinForm');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
const profileRow = document.getElementById('profileRow');
const loginPill = document.getElementById('loginPill');

pinForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (pinInput.value.trim() === PASSCODE) {
    pinForm.classList.add('hidden');
    profileRow.classList.remove('hidden');
    loginPill.textContent = 'Tap your name 💕';
    pinError.classList.remove('show');
  } else {
    pinError.classList.remove('show');
    void pinError.offsetWidth; // restart the shake animation
    pinError.classList.add('show');
    pinInput.value = '';
    pinInput.focus();
  }
});

document.querySelectorAll('.profile-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    localStorage.setItem('aa_profile', btn.dataset.name);
    window.location.href = 'journey.html';
  });
});
