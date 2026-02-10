// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rrcgnssytphudyvgjrce.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2duc3N5dHBodWR5dmdqcmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDgxMDgsImV4cCI6MjA4NTk4NDEwOH0.0Vlds0jAfukc7OwL9nqrxyYjJV3ghLBMMVzQcV-OmFk';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const manualForm = document.getElementById('manual-booking-form');
const searchInput = document.getElementById('admin-search');

// --- 2. VACATION / DAY OFF LOGIC ---

// Fetch and display blocked dates from Supabase
async function loadBlockedDates() {
    const listContainer = document.getElementById('blocked-list');
    
    try {
        const { data: blocked, error } = await _supabase
            .from('blocked_dates')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        listContainer.innerHTML = '';
        if (!blocked || blocked.length === 0) {
            listContainer.innerHTML = '<p style="color:var(--text-dim); font-size:0.8rem;">No dates blocked.</p>';
            return;
        }

        blocked.forEach(item => {
            const div = document.createElement('div');
            div.className = 'blocked-date-item';
            div.innerHTML = `
                <span>📅 ${item.date}</span>
                <button class="btn-remove-date" onclick="unblockDate('${item.date}')" title="Unblock Date">×</button>
            `;
            listContainer.appendChild(div);
        });
    } catch (err) {
        console.error("Error loading blocked dates:", err);
    }
}

// Block a new date
window.blockDate = async function() {
    const dateInput = document.getElementById('block-date');
    const dateVal = dateInput.value;

    if (!dateVal) {
        alert("Please select a date first.");
        return;
    }

    try {
        const { error } = await _supabase
            .from('blocked_dates')
            .insert([{ date: dateVal }]);

        if (error) {
            if (error.code === '23505') alert("This date is already blocked!");
            else throw error;
        } else {
            dateInput.value = '';
            loadBlockedDates();
        }
    } catch (err) {
        alert("Error blocking date: " + err.message);
    }
};

// Unblock a date
window.unblockDate = async function(date) {
    if (!confirm(`Open shop again on ${date}?`)) return;

    try {
        const { error } = await _supabase
            .from('blocked_dates')
            .delete()
            .eq('date', date);

        if (error) throw error;
        loadBlockedDates();
    } catch (err) {
        alert("Error unblocking: " + err.message);
    }
};


// --- 3. MANUAL BOOKING LOGIC ---

manualForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newBooking = {
        name: document.getElementById('m-name').value,
        phone: document.getElementById('m-phone').value,
        service: document.getElementById('m-service').value,
        date: document.getElementById('m-date').value,
        time: document.getElementById('m-time').value,
        paid: "Manual Entry"
    };

    try {
        // Check for existing booking
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


// --- 4. LOAD & RENDER BOOKINGS ---

async function loadBookings() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Refreshing schedule...</td></tr>';

    try {
        const { data: db, error } = await _supabase
            .from('bookings')
            .select('*');

        if (error) throw error;

        // Store globally for search filtering
        window.allBookings = db;
        renderTable(db);
        updateStats(db);

    } catch (err) {
        console.error("Load error:", err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#ff4444">Connection Error.</td></tr>';
    }
}

function renderTable(bookings) {
    const tbody = document.getElementById('admin-table-body');
    const todayStr = new Date().toISOString().split("T")[0];
    tbody.innerHTML = '';

    // Sort: Earliest date/time first
    bookings.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    bookings.forEach((booking) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Customer"><strong>${booking.name}</strong></td>
            <td data-label="Phone">
                <a href="tel:${booking.phone}" style="color:var(--admin-accent); text-decoration:none;">
                    ${booking.phone || 'No Phone'}
                </a>
            </td>
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
}

function updateStats(bookings) {
    const todayStr = new Date().toISOString().split("T")[0];
    let revenue = 0;
    let todayCount = 0;

    bookings.forEach(b => {
        if (b.date === todayStr) todayCount++;
        
        let price = 0;
        if (b.service === "Haircut Only") price = 30;
        else if (b.service === "Hair & Beard") price = 45;
        else price = 65;
        revenue += price;
    });

    document.getElementById('stat-count').textContent = bookings.length;
    document.getElementById('stat-today').textContent = todayCount;
    document.getElementById('stat-revenue').textContent = `$${revenue}`;
}


// --- 5. SEARCH LOGIC ---

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = window.allBookings.filter(b => 
        b.name.toLowerCase().includes(term) || 
        (b.phone && b.phone.includes(term))
    );
    renderTable(filtered);
});


// --- 6. DELETE BOOKING ---

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

// Initialize everything
loadBookings();
loadBlockedDates();