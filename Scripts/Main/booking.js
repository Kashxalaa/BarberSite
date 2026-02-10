// 1. INITIALIZE DATE PICKER
// Note: We removed the 'const' lines here because they are declared in config.js
dateInput.min = new Date().toISOString().split("T")[0];

// 2. FETCH TIME SLOTS LOGIC
dateInput.addEventListener('change', async () => {
    const date = dateInput.value;
    const currentLang = langSwitch.value; 
    if(!date) return;

    // UI Reset
    timeSlotsContainer.innerHTML = `<p style="color:var(--primary); grid-column: 1/-1;">${translations[currentLang].checking}</p>`;
    timeSection.classList.remove('hidden');
    finalForm.classList.add('hidden');

    const selectedDate = new Date(date);
    // Sunday Check
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

// 3. SAVE BOOKING LOGIC
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