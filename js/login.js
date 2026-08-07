document.querySelectorAll('.profile-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    localStorage.setItem('aa_profile', btn.dataset.name);
    window.location.href = 'journey.html';
  });
});
