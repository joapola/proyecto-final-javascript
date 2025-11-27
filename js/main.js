// Lista donde guardamos las actividades
let activities = [];
let currentFilter = 'todas'; 
let currentSearch = '';
let currentSort = 'fecha';

// Elementos del DOM
const activityForm = document.getElementById('activityForm');
const activityTableBody = document.getElementById('activityTableBody');
const rowTemplate = document.getElementById('rowTemplate');
const emptyState = document.getElementById('emptyState');

const statTotal = document.getElementById('statTotal');
const statCompleted = document.getElementById('statCompleted');
const statPending = document.getElementById('statPending');
const statHours = document.getElementById('statHours');

const filterButtons = document.querySelectorAll('.btn-filter');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');

function init() {
  activityForm.addEventListener('submit', handleSubmit);

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter || 'todas';
      renderTable();
    });
  });

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    renderTable();
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTable();
  });

  renderTable();
}

function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(activityForm);
  const title = (formData.get('title') || '').trim();
  const subject = (formData.get('subject') || '').trim();
  const type = (formData.get('type') || '').trim();
  const difficulty = (formData.get('difficulty') || '').trim();
  const priority = (formData.get('priority') || '').trim();
   const date = formData.get('deadline') || '';      
  const timeEst = formData.get('estimatedTime') || '';
  const notes = (formData.get('notes') || '').trim();
  const important = formData.get('isImportant') === 'on'; 

  if (!title) {
    alert('El título no puede estar vacío.');
    return;
  }

  let timeNumber = null;
  if (timeEst !== '') {
    timeNumber = Number(timeEst);
    if (isNaN(timeNumber) || timeNumber < 0) {
      alert('El tiempo estimado debe ser un número mayor o igual a 0.');
      return;
    }
  }

  const activity = {
    id: Date.now() + Math.random().toString(16).slice(2),
    title,
    subject,
    type,
    difficulty,
    priority,
    date: date || null,
    time: timeNumber,
    notes,
    important,
    completed: false
  };

  activities.push(activity);
  activityForm.reset();
  renderTable();
}

function renderTable() {
  activityTableBody.innerHTML = '';

  let filtered = activities.slice();

  if (currentFilter === 'pendientes') filtered = filtered.filter(a => !a.completed);
  if (currentFilter === 'completadas') filtered = filtered.filter(a => a.completed);

  if (currentSearch) {
    filtered = filtered.filter(a =>
      (a.title && a.title.toLowerCase().includes(currentSearch)) ||
      (a.subject && a.subject.toLowerCase().includes(currentSearch))
    );
  }

  if (currentSort === 'fecha') {
    filtered.sort((a,b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
  } else if (currentSort === 'prioridad') {
    const map = { 'baja': 1, 'media': 2, 'alta': 3 };
    filtered.sort((a,b) => (map[b.priority] || 0) - (map[a.priority] || 0));
  } else if (currentSort === 'titulo') {
    filtered.sort((a,b) => a.title.localeCompare(b.title));
  }

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  filtered.forEach(activity => {
    const clone = rowTemplate.content.cloneNode(true);
    const tr = clone.querySelector('tr');

    
    const tdTitle = clone.querySelector('.row-title');
    const tdSubject = clone.querySelector('.row-subject');
    const tdType = clone.querySelector('.row-type');
    const tdPriority = clone.querySelector('.badge--priority');
    const tdDate = clone.querySelector('.row-deadline');
    const tdTime = clone.querySelector('.row-time');
    

    tdTitle.textContent = activity.title;
    tdSubject.textContent = activity.subject || '-';
    tdType.textContent = activity.type || '-';
    tdPriority.textContent = activity.priority || '-';
    tdDate.textContent = activity.date || '-';
    tdTime.textContent = (activity.time !== null ? activity.time : '-');

    const checkbox = clone.querySelector('.row-complete');
    if (checkbox) {
      checkbox.checked = !!activity.completed;
      checkbox.dataset.id = activity.id;
      checkbox.addEventListener('change', (e) => {
        toggleComplete(activity.id, e.target.checked);
      });
    }

    const btnDelete = clone.querySelector('.btn-delete');
    if (btnDelete) {
      btnDelete.dataset.id = activity.id;
      btnDelete.addEventListener('click', () => {
        deleteActivity(activity.id);
      });
    }

    if (activity.completed) tr.classList.add('is-completed');
    if (activity.important) tr.classList.add('is-important');

    activityTableBody.appendChild(clone);
  });

  updateStats();
}

function toggleComplete(id, isCompleted) {
  const idx = activities.findIndex(a => a.id === id);
  if (idx !== -1) {
    activities[idx].completed = !!isCompleted;
    renderTable();
  }
}

function deleteActivity(id) {
  activities = activities.filter(a => a.id !== id);
  renderTable();
}

function updateStats() {
  const total = activities.length;
  const completed = activities.filter(a => a.completed).length;
  const pending = total - completed;
  const hours = activities.reduce((acc, a) => acc + (a.time ? Number(a.time) : 0), 0);

  statTotal.textContent = total;
  statCompleted.textContent = completed;
  statPending.textContent = pending;
  statHours.textContent = hours;
}

init();

