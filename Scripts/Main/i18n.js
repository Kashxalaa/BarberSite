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

function setLanguage(lang) {
    const currentTranslations = translations[lang];
    if (!currentTranslations) return;

    // Updates text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (currentTranslations[key]) el.textContent = currentTranslations[key];
    });

    // Updates placeholders
    document.querySelectorAll('[data-i18n-holder]').forEach(el => {
        const key = el.getAttribute('data-i18n-holder');
        if (currentTranslations[key]) el.placeholder = currentTranslations[key];
    });

    localStorage.setItem('preferredLang', lang);
}