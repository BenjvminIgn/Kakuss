document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.getElementById('theme-switch');
    
    // Setear estado inicial del toggle
    if (localStorage.getItem('kakus_theme') === 'dark') {
        themeSwitch.checked = true;
    }

    // Manejar el cambio del switch
    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('kakus_theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('kakus_theme', 'light');
        }
    });
});
