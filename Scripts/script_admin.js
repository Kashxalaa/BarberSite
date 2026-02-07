// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rrcgnssytphudyvgjrce.supabase.co';

// CRITICAL: Replace the text below with your long 'anon public' key from Supabase Settings -> API
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2duc3N5dHBodWR5dmdqcmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDgxMDgsImV4cCI6MjA4NTk4NDEwOH0.0Vlds0jAfukc7OwL9nqrxyYjJV3ghLBMMVzQcV-OmFk';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const manualForm = document.getElementById('manual-booking-form');

// 2. ADD MANUAL BOOKING (SQL VERSION)
manualForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newBooking = {
        name: document.getElementById('m-name').value + " 📞",
        service: document.getElementById('m-service').value,
        date: document.getElementById('m-date').value,
        time: document.getElementById('m-time').value,
        paid: "Manual Entry"
    };

    try {
        // Check for existing booking in SQL
        const { data: existing } = await _supabase
            .from('bookings')
            .select('id')
            .eq('date', newBooking.date)
            .eq('time', newBooking.time);

        if (existing && existing.length > 0) {
            alert("This time slot is already taken!");
            return;
        }

        const { error } = await _supabase
            .from('bookings')
            .insert([newBooking]);

        if (error) throw error;

        manualForm.reset();
        loadBookings(); 
    } catch (err) {
        alert("Error saving: " + err.message);
    }
});

// 3. LOAD & RENDER BOOKINGS
async function loadBookings() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Refreshing schedule...</td></tr>';

    try {
        const { data: db, error } = await _supabase
            .from('bookings')
            .select('*');

        if (error) throw error;

        const todayStr = new Date().toISOString().split("T")[0];
        tbody.innerHTML = '';
        let revenue = 0;
        let todayCount = 0;

        // Sort: Earliest date/time first
        db.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        db.forEach((booking) => {
            if (booking.date === todayStr) todayCount++;
            
            let price = 0;
            if (booking.service === "Haircut Only") price = 30;
            else if (booking.service === "Hair & Beard") price = 45;
            else price = 65;
            revenue += price;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Customer"><strong>${booking.name}</strong></td>
                <td data-label="Service">${booking.service}</td>
                <td data-label="Date">${booking.date}</td>
                <td data-label="Time">${booking.time}</td>
                <td data-label="Status">
                    <span class="badge ${booking.paid === 'Manual Entry' ? 'badge-manual' : 'badge-deposit'}">
                        ${booking.paid}
                    </span>
                </td>
                <td data-label="Action">
                    <button class="btn-delete" onclick="deleteBooking('${booking.id}')">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update Stats UI
        document.getElementById('stat-count').textContent = db.length;
        document.getElementById('stat-today').textContent = todayCount;
        document.getElementById('stat-revenue').textContent = `$${revenue}`;

    } catch (err) {
        console.error("Load error:", err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#ff4444">Connection Error. Verify API Key.</td></tr>';
    }
}

// 4. DELETE BOOKING
window.deleteBooking = async function(id) {
    if (confirm('Permanently remove this appointment?')) {
        try {
            const { error } = await _supabase
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadBookings();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    }
};

// Start
loadBookings();