let events = [];

let editingEventId = null;

function init() {
    saveTheme();
    updateDateDisplay();
    generateTimeSlots();
    loadEventsFromLocalStorage();
    uploadClasses();
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
        e.preventDefault();
        saveEvent(e);
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
        id: editingEventId || Date.now().toString(),
        title,
        startTime,
        endTime,
        eventColor
    }

    if (editingEventId) {
        const index = events.findIndex(event => event.id === editingEventId);
        if (index !== -1) {
            events[index] = eventData;
        }

    }
    else {
        events.push(eventData);
    }

    console.log('Evento salvo:', eventData);
    saveEventsToLocalStorage();
    renderEvents();
    closeEventModal();
}

function renderEvents() {
    const existingEvents = document.querySelectorAll('.event');
    existingEvents.forEach(event => event.remove());

    events.forEach(event => renderEvent(event));
}

function renderEvent(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event event-${event.eventColor}`;
    eventElement.textContent = event.title;
    eventElement.dataset.id = event.id;

    const startHour = parseInt(event.startTime.split(':')[0], 10);
    const startMinute = parseInt(event.startTime.split(':')[1], 10);
    const endtHour = parseInt(event.endTime.split(':')[0], 10);
    const endMinute = parseInt(event.endTime.split(':')[1], 10);

    if (startHour < 6 || endtHour >= 23) {
        console.warn('Evento fora do horário permitido:', event);
        return;
    }

    const startPosition = ((startHour - 6) * 60 + startMinute) * (60 / 60);
    const duration = ((endtHour - startHour) * 60 + (endMinute - startMinute));
    const height = Math.max(20, duration * (60 / 60));

    eventElement.style.top = `${startPosition}px`;
    eventElement.style.height = `${height}px`;

    eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openEventModal(null, event);
    });

    eventElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            deleteEvent(event.id);
        }
    });

    document.getElementById('calendarBody').appendChild(eventElement);
}

function deleteEvent(eventId) {
    events = events.filter(event => event.id !== eventId);
    saveEventsToLocalStorage();
    renderEvents();
}

function clearAllEvents() {
    if (events.length === 0) {
        alert('Não há eventos para limpar.');
        return;
    }

    if (confirm('Tem certeza que deseja limpar todos os eventos?')) {
        events = [];
        clearEventsFromLocalStorage();
        localStorage.removeItem('aulasCarregadas');
        renderEvents();
    }
}

function scrollToCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour >= 6 && currentHour < 23) {
        const position = ((currentHour - 6) * 60 + currentMinute) * (60 / 60);
        const calendarContainer = document.querySelector('.calendar-container');
        calendarContainer.scrollTop = Math.max(0, position - 200);
    }
}

function updateCurrentTimeIndicator() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const indicator = document.getElementById('currentTimeIndicator');

    if (!indicator) {
        console.warn("Elemento #currentTimeIndicator não encontrado no DOM.");
        return;
    }

    if (currentHour >= 6 && currentHour < 23) {
        const position = ((currentHour - 6) * 60 + currentMinute) * (60 / 60);
        indicator.style.top = `${position}px`;
        indicator.style.display = 'block';
    }
    else {
        indicator.style.display = 'none';
    }
}

function saveEventsToLocalStorage() {
    localStorage.setItem('agendaEvents', JSON.stringify(events));
}

function loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem('agendaEvents');
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    }
}

function clearEventsFromLocalStorage() {
    localStorage.removeItem('agendaEvents');
}

function abrirMenu() {
    document.getElementById("menu_aba").style.display = "block";
    const indicator = document.getElementById('currentTimeIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

function fecharMenu() {
    document.getElementById("menu_aba").style.display = "none";    
    updateCurrentTimeIndicator();
}

function temaLim() {
    document.documentElement.style.setProperty('--cor-click', '#38184C');
    document.documentElement.style.setProperty('--cor-sombra', '#9b0a59');
    document.documentElement.style.setProperty('--backgroundPrimary', '#CEF09D');
    localStorage.setItem('tema', 'lim');
}

function temaInatel() {
    document.documentElement.style.setProperty('--cor-click', '#126ae2');
    document.documentElement.style.setProperty('--cor-sombra', '#0a599b');
    document.documentElement.style.setProperty('--backgroundPrimary', '#edf2f4');
    localStorage.setItem('tema', 'inatel');
}

function temaDark() {
    const cores = {
        '--cor-click': '#CEF09D',
        '--cor-sombra': '#9b0a59',
        '--backgroundPrimary': '#38184C',
    };

    for (const [variavel, valor] of Object.entries(cores)) {
        document.documentElement.style.setProperty(variavel, valor);
    }

    localStorage.setItem('tema', 'dark');
}

function saveTheme() {
    const theme = localStorage.getItem('tema');

    if (theme === 'lim') temaLim();
    else if (theme === 'inatel') temaInatel();
    else if (theme === 'dark') temaDark();
}

const aulasData = [
    {
        "id": 1,
        "disciplina": "S05 - Interface Homem-máquina",
        "data": "ter",
        "horario": "10:00",
        "local": "P1-S17",
        "prova_alert": false,
        "prova": "12/05",
        "frequencia": "10/25",
        "nota": "9"
    },
    {
        "id": 2,
        "disciplina": "E01 - Circuitos Elétricos em Corrente Contínua",
        "data": "ter",
        "horario": "13:30",
        "local": "P1-S17",
        "prova_alert": true,
        "prova": "12/05",
        "frequencia": "10/25",
        "nota": "5"
    },
    {
        "id": 3,
        "disciplina": "M02 - Álgebra e Geometria Analítica",
        "data": "ter",
        "horario": "15:30",
        "local": "P1-S17",
        "prova_alert": true,
        "prova": "12/05",
        "frequencia": "10/25",
        "nota": "7"
    }
];

function uploadClasses() {
    const aulasJaCarregadas = localStorage.getItem('aulasCarregadas');
    
    if (aulasJaCarregadas) {
        renderEvents();
        return;
    }

    localStorage.setItem('aulasCarregadas', 'true');
    
    aulasData.forEach(aula => {
        const start = aula.horario;
        const [h, m] = start.split(':').map(Number);
        const totalMin = h * 60 + m + 100;
        const fimHora = Math.floor(totalMin / 60).toString().padStart(2, "0");
        const fimMin = (totalMin % 60).toString().padStart(2, "0");
        const endHour = `${fimHora}:${fimMin}`;

        const event = {
            id: `aula-${aula.id}`,
            title: aula.disciplina,
            startTime: start,
            endTime: endHour,
            eventColor: "blue"
        }

        events.push(event);
    });

    saveEventsToLocalStorage();
    renderEvents();
}

init();