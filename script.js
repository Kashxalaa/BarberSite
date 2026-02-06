const themeToggle = document.getElementById('theme-toggle');
const dateInput = document.getElementById('booking-date');
const timeSection = document.getElementById('time-section');
const timeSlotsContainer = document.getElementById('time-slots');
const finalForm = document.getElementById('final-form');
const serviceCards = document.querySelectorAll('.service-card');
const totalDisplay = document.getElementById('total-display');

let selectedService = { name: "Haircut Only", price: 30 };
let selectedTime = null;

dateInput.min = new Date().toISOString().split("T")[0];

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        serviceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedService.name = card.dataset.name;
        selectedService.price = parseInt(card.dataset.price);
        totalDisplay.textContent = `$${selectedService.price}`;
    });
});

dateInput.addEventListener('change', () => {
    const date = dateInput.value;
    timeSlotsContainer.innerHTML = '';
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const db = JSON.parse(localStorage.getItem('barberBookings')) || [];

    hours.forEach(time => {
        const isTaken = db.some(b => b.date === date && b.time === time);
        const btn = document.createElement('button');
        btn.className = `slot ${isTaken ? 'booked' : 'available'}`;
        btn.textContent = time;
        if (!isTaken) {
            btn.onclick = () => {
                document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTime = time;
                finalForm.classList.remove('hidden');
            };
        }
        timeSlotsContainer.appendChild(btn);
    });
    timeSection.classList.remove('hidden');
});

finalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
    const booking = {
        name: document.getElementById('user-name').value,
        service: selectedService.name,
        date: dateInput.value,
        time: selectedTime,
        paid: payMethod === 'deposit' ? '$10 Deposit' : `$${selectedService.price} Full`
    };
    const db = JSON.parse(localStorage.getItem('barberBookings')) || [];
    db.push(booking);
    localStorage.setItem('barberBookings', JSON.stringify(db));
    document.getElementById('booking-flow').classList.add('hidden');
    document.getElementById('success-msg').classList.remove('hidden');
    document.getElementById('summary-text').innerHTML = `Set for ${booking.time} on ${booking.date}.`;
});