const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

// Already signed in on this device — skip straight to the journey.
supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) window.location.replace('journey.html');
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');
  loginSubmitBtn.disabled = true;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value,
  });

  loginSubmitBtn.disabled = false;

  if (error) {
    loginError.classList.remove('show');
    void loginError.offsetWidth; // restart the shake animation
    loginError.classList.add('show');
    passwordInput.value = '';
    passwordInput.focus();
    return;
  }

  window.location.href = 'journey.html';
});
