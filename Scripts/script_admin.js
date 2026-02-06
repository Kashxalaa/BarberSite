// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rrcgnssytphudyvgjrce.supabase.co';
const SUPABASE_KEY = '703cba2f-2718-4977-8aa8-16ba6311dfc4';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        // Check if slot is taken in SQL
        const { data: existing } = await supabase
            .from('bookings')
            .select('id')
            .eq('date', newBooking.date)
            .eq('time', newBooking.time);

        if (existing && existing.length > 0) {
            alert("This slot is already occupied!");
            return;
        }

        // Insert into SQL
        const { error } = await supabase
            .from('bookings')
            .insert([newBooking]);

        if (error) throw error;

        manualForm.reset();
        loadBookings(); // Refresh table
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// 3. LOAD BOOKINGS (SQL VERSION)
async function loadBookings() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Loading schedule...</td></tr>';

    try {
        const { data: db, error } = await supabase
            .from('bookings')
            .select('*');

        if (error) throw error;

        const todayStr = new Date().toISOString().split("T")[0];
        tbody.innerHTML = '';
        let revenue = 0;
        let todayCount = 0;

        // Sort by date and time
        db.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        db.forEach((booking) => {
            if (booking.date === todayStr) todayCount++;
            
            // Calculate revenue based on service
            let price = 0;
            if (booking.service === "Haircut Only") price = 30;
            else if (booking.service === "Hair & Beard") price = 45;
            else if (booking.service === "The Royal Treatment") price = 65;
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

        // Update Stats
        document.getElementById('stat-count').textContent = db.length;
        document.getElementById('stat-today').textContent = todayCount;
        document.getElementById('stat-revenue').textContent = `$${revenue}`;

    } catch (err) {
        console.error("Load error:", err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--danger)">Error loading data.</td></tr>';
    }
}

// 4. DELETE BOOKING (SQL VERSION)
window.deleteBooking = async function(id) {
    if (confirm('Permanently remove this appointment?')) {
        try {
            const { error } = await supabase
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

// Initial Load
loadBookings();