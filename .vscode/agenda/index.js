let events = [];
let editingEventId = null;

function init() {
    updateDateDisplay();
    generateTimeSlots();
    setupEventListeners();
    updateCurrentTimeIndicator();
    setInterval(updateCurrentTimeIndicator, 60000);
}

function updateDateDisplay() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('pt-BR', options);
}

function generateTimeSlots() {
    const timeLabels = document.getElementById('timeLabels');
    const calendarBody = document.getElementById('calendarBody');

    for (let hour = 6; hour < 23; hour++) {
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatTime(hour);
        timeLabels.appendChild(timeLabel);

        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.dataset.hour = hour;
        timeSlot.addEventListener('click', () => openEventModal(hour));
        calendarBody.appendChild(timeSlot);
    }
}

function formatTime(hour) {
    const padded = hour.toString().padStart(2, "0");
    return `${padded}:00`;
}

function setupEventListeners() {
    document.getElementById('addEventBtn').addEventListener('click', () => openEventModal());
    document.getElementById('todayBtn').addEventListener('click', scrollToCurrentTime);
    document.getElementById('clearAllBtn').addEventListener('click', () => clearAllEvents());
    document.getElementById('cancelBtn').addEventListener('click', () => closeEventModal());

    const eventForm = document.getElementById('eventForm');
    eventForm.addEventListener('submit', saveEvent);

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault
        saveEvent
    });

    document.getElementById('eventModal').addEventListener('click', (e) => {
        if (e.target.id === 'eventModal') {
            closeEventModal();
        }
    });
}

function openEventModal(hour = null, event = null) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const eventTitle = document.getElementById('eventTitle');
    const eventStart = document.getElementById('eventStart');
    const eventEnd = document.getElementById('eventEnd');
    const eventColor = document.getElementById('eventColor');

    if (event) {
        modalTitle.textContent = 'Editar evento';
        eventTitle.value = event.title;
        eventStart.value = event.startTime;
        eventEnd.value = event.endTime;
        eventColor.value = event.eventColor;
        editingEventId = event.id;
    }
    else {
        modalTitle.textContent = 'Adicionar novo evento';
        eventTitle.value = '';
        eventStart.value = hour ? formatTime(hour) : '09:00';
        eventEnd.value = hour ? formatTime(hour + 1) : '10:00';
        eventColor.value = 'blue';
        editingEventId = null;
    }

    modal.style.display = 'block';
    eventTitle.focus();
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    editingEventId = null;
}

function saveEvent(e) {
    e.preventDefault();

    const title = document.getElementById('eventTitle').value.trim();
    const startTime = document.getElementById('eventStart').value;
    const endTime = document.getElementById('eventEnd').value;
    const eventColor = document.getElementById('eventColor').value; 

    console.log('Salvando evento:', { title, startTime, endTime, eventColor });

    if (!title || !startTime || !endTime) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (startTime >= endTime) {
        alert('O horário de início deve ser antes do horário de término.');
        return;
    }

    const eventData = {
        id: editingEventId || Date.now().toString,
        title,
        startTime,
        endTime,
        color
    }

    if (editingEventId) {
        const index = events.findIndex(event => event.id === editingEventId);
        if (index !== -1) {
            events[index] = eventData;
        }
        else{         
            events.push(eventData);
        }

        console.log('Evento salvo:', eventData);
        renderEvents();
        closeEventModal();
    }
}