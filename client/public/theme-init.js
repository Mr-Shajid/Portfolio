
(function () {
  try {
    var saved = localStorage.getItem('theme')
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark')
    }
  } catch {
    Error('Failed to initialize theme')
  }
})()