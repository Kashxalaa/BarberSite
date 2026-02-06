const manualForm = document.getElementById('manual-booking-form');

        manualForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newBooking = {
                name: document.getElementById('m-name').value + " 📞",
                service: document.getElementById('m-service').value,
                date: document.getElementById('m-date').value,
                time: document.getElementById('m-time').value,
                paid: "Manual Entry"
            };

            const db = JSON.parse(localStorage.getItem('barberBookings')) || [];
            const isTaken = db.some(b => b.date === newBooking.date && b.time === newBooking.time);
            
            if(isTaken) {
                alert("This slot is already occupied!");
                return;
            }

            db.push(newBooking);
            localStorage.setItem('barberBookings', JSON.stringify(db));
            manualForm.reset();
            loadBookings();
        });

        function loadBookings() {
            const db = JSON.parse(localStorage.getItem('barberBookings')) || [];
            const tbody = document.getElementById('admin-table-body');
            const todayStr = new Date().toISOString().split("T")[0];
            tbody.innerHTML = '';

            let revenue = 0;
            let todayCount = 0;

            db.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

            db.forEach((booking, index) => {
                if (booking.date === todayStr) todayCount++;
                
                let price = booking.service === "Haircut Only" ? 30 : (booking.service === "Hair & Beard" ? 45 : 65);
                revenue += price;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${booking.name}</strong></td>
                    <td>${booking.service}</td>
                    <td>${booking.date}</td>
                    <td>${booking.time}</td>
                    <td><span class="badge ${booking.paid === 'Manual Entry' ? 'badge-manual' : 'badge-deposit'}">${booking.paid}</span></td>
                    <td><button class="btn-delete" onclick="deleteBooking(${index})">Remove</button></td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('stat-count').textContent = db.length;
            document.getElementById('stat-today').textContent = todayCount;
            document.getElementById('stat-revenue').textContent = `$${revenue}`;
        }

        function deleteBooking(index) {
            if (confirm('Permanently remove this appointment?')) {
                const db = JSON.parse(localStorage.getItem('barberBookings')) || [];
                db.splice(index, 1);
                localStorage.setItem('barberBookings', JSON.stringify(db));
                loadBookings();
            }
        }

        loadBookings();