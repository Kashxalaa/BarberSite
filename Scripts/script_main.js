// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rrcgnssytphudyvgjrce.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2duc3N5dHBodWR5dmdqcmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDgxMDgsImV4cCI6MjA4NTk4NDEwOH0.0Vlds0jAfukc7OwL9nqrxyYjJV3ghLBMMVzQcV-OmFk';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. DOM ELEMENTS
const themeToggle = document.getElementById('theme-toggle');
const dateInput = document.getElementById('booking-date');
const timeSection = document.getElementById('time-section');
const timeSlotsContainer = document.getElementById('time-slots');
const finalForm = document.getElementById('final-form');
const serviceCards = document.querySelectorAll('.service-card');
const totalDisplay = document.getElementById('total-display');
const langSwitch = document.getElementById('lang-switch');
const submitBtn = document.getElementById('submit-btn');

// 3. TRANSLATIONS DATA
const translations = {
    en: {
        our_work: "Our Recent Work",
        select_service: "Select Service",
        s1_title: "Haircut Only", s1_desc: "Clean fade or classic scissor cut",
        s2_title: "Hair & Beard", s2_desc: "Complete grooming & sculpt",
        s3_title: "The Royal Treatment", s3_desc: "Hair, Beard, and Hot Towel Shave",
        pick_date: "Pick a Date", avail_hours: "Available Hours",
        finalize: "Finalize Appointment", your_name: "Your Name",
        phone_number: "Phone Number", choose_pay: "Choose Payment",
        pay_deposit: "Pay $10 Deposit", pay_full: "Pay Full",
        btn_reserve: "Reserve My Chair", confirmed: "Confirmed!",
        book_another: "Book Another", name_placeholder: "Enter Full Name",
        phone_placeholder: "Enter phone number", processing: "Processing...",
        checking: "Checking availability...", closed_sun: "Closed on Sundays",
        vacation: "Closed for Vacation", expired: "Expired", error_slots: "Error loading slots."
    },
    ru: {
        our_work: "Наши работы",
        select_service: "Выберите услугу",
        s1_title: "Только стрижка", s1_desc: "Чистый фейд или классика",
        s2_title: "Стрижка и борода", s2_desc: "Полный уход и моделирование",
        s3_title: "Королевский уход", s3_desc: "Волосы, борода и бритье",
        pick_date: "Выберите дату", avail_hours: "Доступное время",
        finalize: "Завершить запись", your_name: "Ваше имя",
        phone_number: "Номер телефона", choose_pay: "Способ оплаты",
        pay_deposit: "Депозит $10", pay_full: "Полная оплата",
        btn_reserve: "Забронировать", confirmed: "Подтверждено!",
        book_another: "Записаться еще раз", name_placeholder: "Введите имя",
        phone_placeholder: "Введите номер", processing: "Обработка...",
        checking: "Проверка...", closed_sun: "Закрыто в воскресенье",
        vacation: "Закрыто на отпуск", expired: "Прошло", error_slots: "Ошибка загрузки."
    },
    ka: {
        our_work: "ჩვენი ნამუშევრები",
        select_service: "აირჩიეთ მომსახურება",
        s1_title: "მხოლოდ თმის შეჭრა", s1_desc: "კლასიკური ან ფეიდი",
        s2_title: "თმა და წვერი", s2_desc: "სრული მოვლა",
        s3_title: "სამეფო მომსახურება", s3_desc: "თმა, წვერი და ცხელი პირსახოცი",
        pick_date: "აირჩიეთ თარიღი", avail_hours: "თავისუფალი საათები",
        finalize: "ჯავშნის დასრულება", your_name: "თქვენი სახელი",
        phone_number: "ტელეფონის ნომერი", choose_pay: "გადახდის მეთოდი",
        pay_deposit: "დეპოზიტი $10", pay_full: "სრული გადახდა",
        btn_reserve: "დაჯავშნე", confirmed: "დადასტურებულია!",
        book_another: "ახალი ჯავშანი", name_placeholder: "შეიყვანეთ სახელი",
        phone_placeholder: "შეიყვანეთ ნომერი", processing: "მუშავდება...",
        checking: "მოწმდება...", closed_sun: "კვირას არ ვმუშაობთ",
        vacation: "გვაქვს დასვენება", expired: "გავიდა", error_slots: "შეცდომა ჩატვირთვისას."
    }
};

let selectedService = { name: "Haircut Only", price: 30 };
let selectedTime = null;

// Init Date Picker
dateInput.min = new Date().toISOString().split("T")[0];

function setLanguage(lang) {
    const currentTranslations = translations[lang];
    if (!currentTranslations) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (currentTranslations[key]) el.textContent = currentTranslations[key];
    });

    document.querySelectorAll('[data-i18n-holder]').forEach(el => {
        const key = el.getAttribute('data-i18n-holder');
        if (currentTranslations[key]) el.placeholder = currentTranslations[key];
    });

    localStorage.setItem('preferredLang', lang);
}

langSwitch.addEventListener('change', (e) => setLanguage(e.target.value));

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

// --- FETCH TIME SLOTS ---
dateInput.addEventListener('change', async () => {
    const date = dateInput.value;
    const currentLang = langSwitch.value;
    if(!date) return;

    // UI Reset
    timeSlotsContainer.innerHTML = `<p style="color:var(--primary); grid-column: 1/-1;">${translations[currentLang].checking}</p>`;
    timeSection.classList.remove('hidden');
    finalForm.classList.add('hidden');

    const selectedDate = new Date(date);
    if (selectedDate.getUTCDay() === 0) {
        timeSlotsContainer.innerHTML = `<p style="color:var(--danger); grid-column: 1/-1;">${translations[currentLang].closed_sun}</p>`;
        return;
    }

    try {
        const { data: isBlocked } = await _supabase.from('blocked_dates').select('date').eq('date', date).maybeSingle();

        if (isBlocked) {
            timeSlotsContainer.innerHTML = `<p style="color:var(--danger); grid-column: 1/-1;">${translations[currentLang].vacation}</p>`;
            return;
        }

        const { data: db, error: dbError } = await _supabase.from('bookings').select('time').eq('date', date);
        if (dbError) throw dbError;

        const now = new Date();
        const isToday = date === now.toISOString().split("T")[0];
        const currentHour = now.getHours();

        const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        timeSlotsContainer.innerHTML = '';

        hours.forEach(time => {
            const slotHour = parseInt(time.split(':')[0]);
            const isTaken = db.some(b => b.time === time);
            const isPast = isToday && slotHour <= currentHour;

            const btn = document.createElement('button');
            btn.className = `slot ${isTaken || isPast ? 'booked' : 'available'}`;
            btn.textContent = isPast && !isTaken ? translations[currentLang].expired : time;
            
            if (!isTaken && !isPast) {
                btn.onclick = (e) => {
                    e.preventDefault(); 
                    document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTime = time;
                    finalForm.classList.remove('hidden');
                    // Smooth scroll to the form after it appears
                    setTimeout(() => {
                        finalForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                };
            } else {
                btn.disabled = true;
            }
            timeSlotsContainer.appendChild(btn);
        });
    } catch (err) {
        timeSlotsContainer.innerHTML = `<p style="color:var(--danger); grid-column: 1/-1;">${translations[currentLang].error_slots}</p>`;
    }
});

// SAVE BOOKING
finalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentLang = langSwitch.value;
    const originalText = submitBtn.innerText;
    
    submitBtn.innerText = translations[currentLang].processing;
    submitBtn.disabled = true;

    const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
    
    const booking = {
        name: document.getElementById('user-name').value,
        phone: document.getElementById('user-phone').value,
        service: selectedService.name,
        date: dateInput.value,
        time: selectedTime,
        paid: payMethod === 'deposit' ? '$10 Deposit' : `$${selectedService.price} Full`
    };

    try {
        const { error } = await _supabase.from('bookings').insert([booking]);
        if (error) throw error;

        document.getElementById('booking-flow').classList.add('hidden');
        document.getElementById('success-msg').classList.remove('hidden');
        
        const successMsg = {
            ka: `დაჯავშნილია <strong>${booking.time}</strong>-ზე, <strong>${booking.date}</strong>. ჩვენ დაგიკავშირდებით ნომერზე: <strong>${booking.phone}</strong>.`,
            ru: `Записано на <strong>${booking.time}</strong>, <strong>${booking.date}</strong>. Мы свяжемся с вами по номеру: <strong>${booking.phone}</strong>.`,
            en: `Set for <strong>${booking.time}</strong> on <strong>${booking.date}</strong>. We will contact you at <strong>${booking.phone}</strong>.`
        };

        document.getElementById('summary-text').innerHTML = successMsg[currentLang] || successMsg.en;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        alert("Booking failed: " + err.message);
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

// Init Lang
const savedLang = localStorage.getItem('preferredLang') || 'en';
langSwitch.value = savedLang;
setLanguage(savedLang);