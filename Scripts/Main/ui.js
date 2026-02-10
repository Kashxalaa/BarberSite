// Theme Switcher
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

// Service Selection
serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        serviceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedService.name = card.dataset.name;
        selectedService.price = parseInt(card.dataset.price);
        totalDisplay.textContent = `$${selectedService.price}`;
    });
});

langSwitch.addEventListener('change', (e) => setLanguage(e.target.value));