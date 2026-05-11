document.addEventListener('DOMContentLoaded', () => {

  // ── Auto-dismiss alert messages after 4 seconds ──────
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity    = '0';
      setTimeout(() => alert.remove(), 500);
    }, 4000);
  });

  // ── Highlight active nav link ─────────────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active', 'fw-semibold');
    }
  });

  // ── Set today as default for applied_date if empty ────
  const appliedDateInput = document.querySelector('input[name="applied_date"]');
  if (appliedDateInput && !appliedDateInput.value) {
    appliedDateInput.value = new Date().toISOString().split('T')[0];
  }

});