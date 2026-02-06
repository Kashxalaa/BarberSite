// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rrcgnssytphudyvgjrce.supabase.co';
const SUPABASE_KEY = '703cba2f-2718-4977-8aa8-16ba6311dfc4';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. DOM ELEMENTS
const themeToggle = document.getElementById('theme-toggle');
const dateInput = document.getElementById('booking-date');
const timeSection = document.getElementById('time-section');
const timeSlotsContainer = document.getElementById('time-slots');
const finalForm = document.getElementById('final-form');
const serviceCards = document.querySelectorAll('.service-card');
const totalDisplay = document.getElementById('total-display');

let selectedService = { name: "Haircut Only", price: 30 };
let selectedTime = null;

// Set minimum date to today
dateInput.min = new Date().toISOString().split("T")[0];

// 3. THEME TOGGLE
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

// 4. SERVICE SELECTION
serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        serviceCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedService.name = card.dataset.name;
        selectedService.price = parseInt(card.dataset.price);
        totalDisplay.textContent = `$${selectedService.price}`;
    });
});

// 5. FETCH AND SHOW TIME SLOTS (SQL Version)
dateInput.addEventListener('change', async () => {
    const date = dateInput.value;
    timeSlotsContainer.innerHTML = '<p style="color:var(--primary); grid-column: 1/-1;">Checking availability...</p>';
    
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    try {
        // Query SQL Database for existing bookings on this date
        const { data: db, error } = await supabase
            .from('bookings')
            .select('time')
            .eq('date', date);

        if (error) throw error;

        timeSlotsContainer.innerHTML = '';
        hours.forEach(time => {
            const isTaken = db.some(b => b.time === time);
            const btn = document.createElement('button');
            btn.className = `slot ${isTaken ? 'booked' : 'available'}`;
            btn.textContent = time;
            
            if (!isTaken) {
                btn.onclick = (e) => {
                    e.preventDefault(); // Prevent page jump
                    document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTime = time;
                    finalForm.classList.remove('hidden');
                };
            } else {
                btn.disabled = true;
            }
            timeSlotsContainer.appendChild(btn);
        });
        timeSection.classList.remove('hidden');
    } catch (err) {
        console.error("Database error:", err);
        timeSlotsContainer.innerHTML = '<p style="color:var(--danger); grid-column: 1/-1;">Failed to load slots.</p>';
    }
});

// 6. SAVE BOOKING (SQL Version)
finalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = e.target.querySelector('.btn-pay');
    btnSubmit.innerText = "Processing...";
    btnSubmit.disabled = true;

    const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
    const booking = {
        name: document.getElementById('user-name').value,
        service: selectedService.name,
        date: dateInput.value,
        time: selectedTime,
        paid: payMethod === 'deposit' ? '$10 Deposit' : `$${selectedService.price} Full`
    };

    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([booking]);

        if (error) throw error;

        // UI Changes on Success
        document.getElementById('booking-flow').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
        document.getElementById('summary-text').innerHTML = `Set for <strong>${booking.time}</strong> on <strong>${booking.date}</strong>.`;
    } catch (err) {
        alert("Booking failed: " + err.message);
        btnSubmit.innerText = "Reserve My Chair";
        btnSubmit.disabled = false;
    }
});