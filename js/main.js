// ======================================
// Improved Task Harvest - Main JavaScript
// ======================================

// ---------- Utility Functions ----------

const updateDate = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options).toUpperCase();
};

const checkMobileDate = () => {
  const mobileView = window.matchMedia("(max-width: 480px)").matches;
  const currentDateElement = document.getElementById('currentDate');
  if (currentDateElement) {
    const options = mobileView
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    currentDateElement.textContent = today.toLocaleDateString('en-US', options).toUpperCase();
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateLong = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  // Expecting timeStr in "HH:MM" 24-hour format
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const formatEventTime = (event) => {
  if (!event.timeStart) return '';
  return event.timeEnd
    ? `${formatTime(event.timeStart)} - ${formatTime(event.timeEnd)}`
    : formatTime(event.timeStart);
};

const getMonthAbbr = (monthIndex) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[monthIndex];
};

// ---------- DOM Elements ----------
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const quickAddTask = document.getElementById('quickAddTask');
const quickAddBtn = document.getElementById('quickAddBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModal = document.getElementById('closeModal');
const cancelTask = document.getElementById('cancelTask');
const saveTask = document.getElementById('saveTask');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const taskId = document.getElementById('taskId');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const dueDate = document.getElementById('dueDate');
const taskCategory = document.getElementById('taskCategory');
const taskRepeat = document.getElementById('taskRepeat');
const priorityOptions = document.querySelectorAll('.priority-option');
const filterOptions = document.querySelectorAll('.filter-option');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const todayCompleted = document.getElementById('todayCompleted');
const totalCompleted = document.getElementById('totalCompleted');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
let taskProject = document.getElementById('taskProject'); // Project dropdown in task modal

// ---------- Modal Setup for Projects & Events ----------

const addMissingModals = () => {
  // If project modal doesn't exist, add it dynamically
  if (!document.getElementById('projectModal')) {
    const projectModalHTML = `
      <div class="modal" id="projectModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="projectModalTitle">ADD NEW PROJECT</div>
            <button class="close-modal" id="closeProjectModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="projectForm">
              <input type="hidden" id="projectId">
              <div class="form-group">
                <label for="projectTitle">Project Title</label>
                <input type="text" id="projectTitle" required>
              </div>
              <div class="form-group">
                <label for="projectDueDate">Due Date</label>
                <input type="date" id="projectDueDate">
              </div>
              <div class="form-group">
                <label for="projectStatus">Status</label>
                <select id="projectStatus">
                  <option value="in-progress">In Progress</option>
                  <option value="at-risk">At Risk</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="modal-btn cancel-btn" id="cancelProject">CANCEL</button>
            <button type="button" class="modal-btn save-btn" id="saveProject">SAVE PROJECT</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', projectModalHTML);
  }

  // If event modal doesn't exist, add it dynamically
  if (!document.getElementById('eventModal')) {
    const eventModalHTML = `
      <div class="modal" id="eventModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="eventModalTitle">ADD NEW EVENT</div>
            <button class="close-modal" id="closeEventModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="eventForm">
              <input type="hidden" id="eventId">
              <div class="form-group">
                <label for="eventTitle">Event Title</label>
                <input type="text" id="eventTitle" required>
              </div>
              <div class="form-group">
                <label for="eventDate">Date</label>
                <input type="date" id="eventDate" required>
              </div>
              <div class="form-group">
                <label for="eventTimeStart">Start Time</label>
                <input type="time" id="eventTimeStart" required>
              </div>
              <div class="form-group">
                <label for="eventTimeEnd">End Time (Optional)</label>
                <input type="time" id="eventTimeEnd">
              </div>
              <div class="form-group">
                <label for="eventType">Type</label>
                <select id="eventType">
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="modal-btn cancel-btn" id="cancelEvent">CANCEL</button>
            <button type="button" class="modal-btn save-btn" id="saveEvent">SAVE EVENT</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', eventModalHTML);
  }

  // If task modal's project dropdown is missing, add it
  if (taskForm && !document.getElementById('taskProject')) {
    const projectDropdownHTML = `
      <div class="form-group">
        <label for="taskProject">Project</label>
        <select id="taskProject">
          <option value="">No Project</option>
        </select>
      </div>`;
    // Insert after the last form group
    const lastFormGroup = taskForm.querySelector('.form-group:last-child');
    lastFormGroup && lastFormGroup.insertAdjacentHTML('afterend', projectDropdownHTML);
  }

  // Refresh our global DOM references
  taskProject = document.getElementById('taskProject');
};

const addCustomStyles = () => {
  // (Optional) Insert or adjust custom CSS here if needed.
};

// ---------- State Management ----------
let tasks = [];
let currentFilter = 'all';
let selectedPriority = 'medium';
let selectedProject = null;

let projects = [
  {
    id: 'proj1',
    title: 'Website Redesign',
    status: 'in-progress',
    dueDate: '2025-03-15',
    completedTasks: 8,
    totalTasks: 12
  },
  {
    id: 'proj2',
    title: 'Annual Marketing Plan',
    status: 'completed',
    completedDate: '2025-01-31',
    completedTasks: 15,
    totalTasks: 15
  },
  {
    id: 'proj3',
    title: 'Product Launch',
    status: 'at-risk',
    dueDate: '2025-04-10',
    completedTasks: 5,
    totalTasks: 20
  }
];

let calendarEvents = [
  {
    id: 'event1',
    title: 'Team Meeting',
    date: '2025-02-26',
    timeStart: '10:00',
    timeEnd: '11:30',
    type: 'meeting'
  },
  {
    id: 'event2',
    title: 'Project Deadline',
    date: '2025-02-26',
    timeStart: '17:00',
    type: 'deadline'
  },
  {
    id: 'event3',
    title: 'Client Presentation',
    date: '2025-02-27',
    timeStart: '14:00',
    timeEnd: '15:00',
    type: 'meeting'
  }
];

let currentMonth = 1; // February (0-indexed)
let currentYear = 2025;

// ---------- Initialization ----------
const initApp = () => {
  addMissingModals();
  addCustomStyles();
  checkMobileDate();
  window.addEventListener('resize', checkMobileDate);
  loadData();
  renderTasks();
  updateProgressStats();
  renderProjects();
  renderCalendar();
  renderEvents();
  renderArchive();
  setupTabNavigation();
  setupEventListeners();
  updateProjectDropdown();
  updateDate();
};

const loadData = () => {
  try {
    const savedTasks = localStorage.getItem('tasks');
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
  } catch (e) {
    console.error("Error loading tasks:", e);
    tasks = [];
  }
  try {
    const savedProjects = localStorage.getItem('projects');
    projects = savedProjects ? JSON.parse(savedProjects) : projects;
  } catch (e) {
    console.error("Error loading projects:", e);
  }
  try {
    const savedEvents = localStorage.getItem('calendarEvents');
    calendarEvents = savedEvents ? JSON.parse(savedEvents) : calendarEvents;
  } catch (e) {
    console.error("Error loading events:", e);
  }
};

// ---------- Tab Navigation ----------
const setupTabNavigation = () => {
  if (!navItems || !tabContents) return;
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      const tabName = item.getAttribute('data-tab');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-content`) {
          content.classList.add('active');
        }
      });
      if (tabName === 'projects') renderProjects();
      else if (tabName === 'calendar') {
        renderCalendar();
        renderEvents();
      }
      else if (tabName === 'archive') renderArchive();
    });
  });
};

// ---------- Event Listeners ----------
const setupEventListeners = () => {
  if (quickAddBtn) quickAddBtn.addEventListener('click', handleQuickAdd);
  if (quickAddTask) quickAddTask.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleQuickAdd();
  });
  if (addTaskBtn) addTaskBtn.addEventListener('click', openAddTaskModal);
  if (closeModal) closeModal.addEventListener('click', closeTaskModal);
  if (cancelTask) cancelTask.addEventListener('click', closeTaskModal);
  if (saveTask) saveTask.addEventListener('click', handleTaskFormSubmit);
  if (taskForm) taskForm.addEventListener('submit', (e) => handleTaskFormSubmit(e));

  priorityOptions.forEach(option => {
    option.addEventListener('click', () => {
      priorityOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedPriority = option.dataset.priority;
    });
  });

  filterOptions.forEach(option => {
    option.addEventListener('click', () => {
      filterOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      currentFilter = option.dataset.filter;
      renderTasks();
    });
  });

  // Projects
  const projectFilterOptions = document.querySelectorAll('#projects-content .filter-option');
  projectFilterOptions.forEach(option => {
    option.addEventListener('click', () => {
      projectFilterOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      renderProjects();
    });
  });

  const calendarFilterOptions = document.querySelectorAll('#calendar-content .filter-option');
  calendarFilterOptions.forEach(option => {
    option.addEventListener('click', () => {
      calendarFilterOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      renderEvents();
    });
  });

  const archiveFilterOptions = document.querySelectorAll('#archive-content .filter-option');
  archiveFilterOptions.forEach(option => {
    option.addEventListener('click', () => {
      archiveFilterOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      renderArchive();
    });
  });

  const calendarNavButtons = document.querySelectorAll('.calendar-nav');
  calendarNavButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.target.textContent === '<' ? changeMonth(-1) : changeMonth(1);
    });
  });

  const newProjectBtn = document.querySelector('#projects-content .action-btn');
  if (newProjectBtn) newProjectBtn.addEventListener('click', openAddProjectModal);
  if (document.getElementById('saveProject')) {
    document.getElementById('saveProject').addEventListener('click', handleProjectFormSubmit);
  }
  if (document.getElementById('cancelProject')) {
    document.getElementById('cancelProject').addEventListener('click', closeProjectModal);
  }
  if (document.getElementById('closeProjectModal')) {
    document.getElementById('closeProjectModal').addEventListener('click', closeProjectModal);
  }
  if (document.getElementById('projectForm')) {
    document.getElementById('projectForm').addEventListener('submit', (e) => handleProjectFormSubmit(e));
  }

  const newEventBtn = document.querySelector('#calendar-content .action-btn');
  if (newEventBtn) newEventBtn.addEventListener('click', openAddEventModal);
  if (document.getElementById('saveEvent')) {
    document.getElementById('saveEvent').addEventListener('click', handleEventFormSubmit);
  }
  if (document.getElementById('cancelEvent')) {
    document.getElementById('cancelEvent').addEventListener('click', closeEventModal);
  }
  if (document.getElementById('closeEventModal')) {
    document.getElementById('closeEventModal').addEventListener('click', closeEventModal);
  }
  if (document.getElementById('eventForm')) {
    document.getElementById('eventForm').addEventListener('submit', (e) => handleEventFormSubmit(e));
  }

  const downloadReportBtn = document.querySelector('#archive-content .action-btn');
  if (downloadReportBtn) downloadReportBtn.addEventListener('click', downloadArchiveData);

  const archiveMonthSelect = document.getElementById('archiveMonth');
  if (archiveMonthSelect) {
    archiveMonthSelect.addEventListener('change', () => renderArchive());
  }

  if (taskProject) {
    taskProject.addEventListener('change', () => {
      selectedProject = taskProject.value !== "" ? taskProject.value : null;
    });
  }
};

// ---------- Task Management Functions ----------
const addTask = (taskData) => {
  const newTask = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    projectId: selectedProject,
    ...taskData,
    updatedAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  updateProgressStats();
  updateProjectStats(selectedProject);
};

const updateTask = (id, updatedData) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;
  const oldProjectId = tasks[index].projectId;
  tasks[index] = {
    ...tasks[index],
    projectId: selectedProject,
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  saveTasks();
  renderTasks();
  updateProgressStats();
  updateProjectStats(oldProjectId);
  updateProjectStats(selectedProject);
};

const toggleTaskComplete = (id) => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  saveTasks();
  renderTasks();
  updateProgressStats();
  updateProjectStats(task.projectId);
};

const deleteTask = (id) => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const projectId = task.projectId;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateProgressStats();
  updateProjectStats(projectId);
};

const toggleTaskDetails = (id) => {
  const taskEl = document.querySelector(`[data-id="${id}"]`);
  taskEl && taskEl.classList.toggle('expanded');
};

const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

// ---------- Project Management Functions ----------
const openAddProjectModal = () => {
  const projectForm = document.getElementById('projectForm');
  const projectIdInput = document.getElementById('projectId');
  const projectModalTitle = document.getElementById('projectModalTitle');
  if (!projectForm || !projectIdInput) return;
  projectForm.reset();
  projectIdInput.value = '';
  projectModalTitle && (projectModalTitle.textContent = 'ADD NEW PROJECT');
  const projectModal = document.getElementById('projectModal');
  projectModal && (projectModal.style.display = 'flex');
};

const openEditProjectModal = (projectId) => {
  const project = projects.find(p => p.id === projectId);
  const projectForm = document.getElementById('projectForm');
  const projectIdInput = document.getElementById('projectId');
  const projectTitleInput = document.getElementById('projectTitle');
  const projectDueDateInput = document.getElementById('projectDueDate');
  const projectStatusSelect = document.getElementById('projectStatus');
  const projectModalTitle = document.getElementById('projectModalTitle');
  if (!project || !projectForm || !projectIdInput || !projectTitleInput || !projectDueDateInput || !projectStatusSelect) return;
  projectForm.reset();
  projectIdInput.value = project.id;
  projectTitleInput.value = project.title;
  projectDueDateInput.value = project.dueDate || '';
  projectStatusSelect.value = project.status;
  projectModalTitle && (projectModalTitle.textContent = 'EDIT PROJECT');
  const projectModal = document.getElementById('projectModal');
  projectModal && (projectModal.style.display = 'flex');
};

const closeProjectModal = () => {
  const projectModal = document.getElementById('projectModal');
  projectModal && (projectModal.style.display = 'none');
};

const handleProjectFormSubmit = (e) => {
  e && e.preventDefault();
  const projectTitleInput = document.getElementById('projectTitle');
  const projectDueDateInput = document.getElementById('projectDueDate');
  const projectStatusSelect = document.getElementById('projectStatus');
  const projectIdInput = document.getElementById('projectId');
  if (!projectTitleInput || !projectDueDateInput || !projectStatusSelect || !projectIdInput) return;
  const id = projectIdInput.value;
  const title = projectTitleInput.value.trim();
  const dueDate = projectDueDateInput.value;
  const status = projectStatusSelect.value;
  if (!title) {
    alert("Project title is required");
    return;
  }
  if (id) {
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return;
    projects[projectIndex] = {
      ...projects[projectIndex],
      title,
      dueDate,
      status,
      completedDate: status === 'completed' && projects[projectIndex].status !== 'completed'
        ? new Date().toISOString()
        : projects[projectIndex].completedDate
    };
  } else {
    const newProject = {
      id: 'proj' + Date.now(),
      title,
      dueDate,
      status,
      completedDate: status === 'completed' ? new Date().toISOString() : null,
      completedTasks: 0,
      totalTasks: 0
    };
    projects.unshift(newProject);
  }
  saveProjects();
  renderProjects();
  updateProjectDropdown();
  closeProjectModal();
};

const deleteProject = (projectId) => {
  if (!confirm("Are you sure you want to delete this project? Associated tasks will be set to 'No Project'.")) return;
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) return;
  tasks.forEach(task => { if (task.projectId === projectId) task.projectId = null; });
  projects.splice(projectIndex, 1);
  saveProjects();
  saveTasks();
  renderProjects();
  renderTasks();
  updateProjectDropdown();
};

const updateProjectStats = (projectId) => {
  if (!projectId) return;
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  project.totalTasks = projectTasks.length;
  project.completedTasks = projectTasks.filter(t => t.completed).length;
  if (project.totalTasks > 0 && project.completedTasks === project.totalTasks) {
    if (project.status !== 'completed') {
      project.status = 'completed';
      project.completedDate = new Date().toISOString();
    }
  } else if (project.status === 'completed') {
    project.status = 'in-progress';
    project.completedDate = null;
  }
  saveProjects();
  renderProjects();
};

const saveProjects = () => localStorage.setItem('projects', JSON.stringify(projects));

const renderProjects = () => {
  const projectsList = document.querySelector('.projects-list');
  if (!projectsList) return;
  const activeFilterElem = document.querySelector('#projects-content .filter-option.active');
  const filter = activeFilterElem ? activeFilterElem.textContent.trim().toLowerCase() : 'all projects';
  let filteredProjects = projects;
  if (filter === 'active projects') filteredProjects = projects.filter(p => p.status !== 'completed');
  else if (filter === 'completed projects') filteredProjects = projects.filter(p => p.status === 'completed');

  projectsList.innerHTML = filteredProjects.map(project => {
    const progressPercentCalc = project.totalTasks === 0 ? 0 : Math.round((project.completedTasks / project.totalTasks) * 100);
    return `
      <div class="project-item">
        <div class="project-header">
          <h3 class="project-title">${project.title}</h3>
          <div class="project-actions">
            <button class="project-btn" onclick="openEditProjectModal('${project.id}')">Edit</button>
            <button class="project-btn" onclick="deleteProject('${project.id}')">Delete</button>
          </div>
          <span class="project-status ${project.status}">${project.status.replace('-', ' ').toUpperCase()}</span>
        </div>
        <div class="project-meta">
          ${project.status === 'completed'
        ? `<span>Completed: ${formatDate(project.completedDate)}</span>`
        : `<span>Due: ${formatDate(project.dueDate)}</span>`}
          <span>Tasks: ${project.completedTasks}/${project.totalTasks} completed</span>
        </div>
        <div class="project-progress">
          <div class="project-progress-bar">
            <div class="project-progress-fill" style="width: ${progressPercentCalc}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('') || '<div class="empty-state"><p>No projects available.</p></div>';
};

// ---------- Calendar Management Functions ----------
const changeMonth = (delta) => {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
  renderEvents();
};

const openAddEventModal = () => {
  const eventForm = document.getElementById('eventForm');
  const eventIdInput = document.getElementById('eventId');
  const eventModalTitle = document.getElementById('eventModalTitle');
  if (!eventForm || !eventIdInput) return;
  eventForm.reset();
  eventIdInput.value = '';
  eventModalTitle && (eventModalTitle.textContent = 'ADD NEW EVENT');
  const eventModal = document.getElementById('eventModal');
  eventModal && (eventModal.style.display = 'flex');
};

const openAddEventModalWithDate = (year, month, day) => {
  openAddEventModal();
  const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (eventDateInput) eventDateInput.value = formattedDate;
};

const openEditEventModal = (eventId) => {
  const event = calendarEvents.find(e => e.id === eventId);
  const eventForm = document.getElementById('eventForm');
  const eventIdInput = document.getElementById('eventId');
  const eventTitleInput = document.getElementById('eventTitle');
  const eventDateInput = document.getElementById('eventDate');
  const eventTimeStartInput = document.getElementById('eventTimeStart');
  const eventTimeEndInput = document.getElementById('eventTimeEnd');
  const eventTypeSelect = document.getElementById('eventType');
  const eventModalTitle = document.getElementById('eventModalTitle');
  if (!event || !eventForm || !eventIdInput || !eventTitleInput || !eventDateInput || !eventTimeStartInput || !eventTypeSelect) return;
  eventForm.reset();
  eventIdInput.value = event.id;
  eventTitleInput.value = event.title;
  eventDateInput.value = event.date;
  eventTimeStartInput.value = event.timeStart;
  eventTimeEndInput.value = event.timeEnd || '';
  eventTypeSelect.value = event.type;
  eventModalTitle && (eventModalTitle.textContent = 'EDIT EVENT');
  const eventModal = document.getElementById('eventModal');
  eventModal && (eventModal.style.display = 'flex');
};

const closeEventModal = () => {
  const eventModal = document.getElementById('eventModal');
  eventModal && (eventModal.style.display = 'none');
};

const handleEventFormSubmit = (e) => {
  e && e.preventDefault();
  const eventIdInput = document.getElementById('eventId');
  const eventTitleInput = document.getElementById('eventTitle');
  const eventDateInput = document.getElementById('eventDate');
  const eventTimeStartInput = document.getElementById('eventTimeStart');
  const eventTimeEndInput = document.getElementById('eventTimeEnd');
  const eventTypeSelect = document.getElementById('eventType');
  if (!eventTitleInput || !eventDateInput || !eventTimeStartInput || !eventTypeSelect || !eventIdInput) return;
  const id = eventIdInput.value;
  const title = eventTitleInput.value.trim();
  const date = eventDateInput.value;
  const timeStart = eventTimeStartInput.value;
  const timeEnd = eventTimeEndInput.value;
  const type = eventTypeSelect.value;
  if (!title || !date || !timeStart) {
    alert("Event title, date, and start time are required");
    return;
  }
  if (id) {
    const eventIndex = calendarEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) return;
    calendarEvents[eventIndex] = { ...calendarEvents[eventIndex], title, date, timeStart, timeEnd, type };
  } else {
    const newEvent = { id: 'event' + Date.now(), title, date, timeStart, timeEnd, type };
    calendarEvents.push(newEvent);
  }
  saveEvents();
  renderCalendar();
  renderEvents();
  closeEventModal();
};

const deleteEvent = (eventId) => {
  if (!confirm("Are you sure you want to delete this event?")) return;
  const eventIndex = calendarEvents.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return;
  calendarEvents.splice(eventIndex, 1);
  saveEvents();
  renderCalendar();
  renderEvents();
};

const saveEvents = () => localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));

const renderCalendar = () => {
  const calendarTitle = document.querySelector('.calendar-title');
  const calendarDates = document.querySelector('.calendar-dates');
  if (!calendarTitle || !calendarDates) return;
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonthReal = today.getMonth();
  const currentYearReal = today.getFullYear();
  const datesWithEvents = calendarEvents
    .filter(event => {
      const [year, month] = event.date.split('-').map(Number);
      return year === currentYear && month - 1 === currentMonth;
    })
    .map(event => parseInt(event.date.split('-')[2]));

  let html = '';
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-date prev-month">${prevMonthDays - i}</div>`;
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === currentDate && currentMonth === currentMonthReal && currentYear === currentYearReal;
    const hasEvents = datesWithEvents.includes(i);
    html += `<div class="calendar-date${isToday ? ' current-date' : ''}${hasEvents ? ' has-events' : ''}" onclick="openAddEventModalWithDate(${currentYear}, ${currentMonth}, ${i})">${i}</div>`;
  }
  // Next month days
  const remainingCells = 42 - (firstDay + daysInMonth);
  for (let i = 1; i <= remainingCells; i++) {
    html += `<div class="calendar-date next-month">${i}</div>`;
  }
  calendarDates.innerHTML = html;
};

// ---------- Improved renderEvents Function ----------
const renderEvents = () => {
  const upcomingEvents = document.querySelector('.upcoming-events');
  if (!upcomingEvents) return;
  const headerHTML = '<h3 class="events-header">UPCOMING EVENTS</h3>';

  const activeFilterElem = document.querySelector('#calendar-content .filter-option.active');
  const filterType = activeFilterElem ? activeFilterElem.textContent.trim().toLowerCase() : 'all events';

  // Filter events for current month
  let filteredEvents = calendarEvents.filter(event => {
    const [year, month] = event.date.split('-').map(Number);
    return year === currentYear && month - 1 === currentMonth;
  }).filter(event => {
    if (filterType === 'meetings') return event.type === 'meeting';
    if (filterType === 'deadlines') return event.type === 'deadline';
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart));

  const eventsHTML = filteredEvents.length === 0
    ? '<div class="empty-state"><p>No events scheduled for this month.</p></div>'
    : filteredEvents.map(event => {
      const [year, month, day] = event.date.split('-');
      const formattedDate = `${getMonthAbbr(parseInt(month) - 1)} ${parseInt(day)}`;
      return `
          <div class="event-item">
            <div class="event-date">${formattedDate}</div>
            <div class="event-details">
              <div class="event-actions">
                <button class="task-btn event-btn" onclick="openEditEventModal('${event.id}')">Edit</button>
                <button class="task-btn event-btn" onclick="deleteEvent('${event.id}')">Delete</button>
              </div>
              <h4 class="event-title">${event.title}</h4>
              <p class="event-time">${formatEventTime(event)}</p>
            </div>
          </div>
        `;
    }).join('');

  upcomingEvents.innerHTML = headerHTML + eventsHTML;
  renderReminders(filteredEvents);
};

const renderReminders = (events) => {
  const reminderList = document.querySelector('.reminder-list');
  if (!reminderList) return;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(event => event.date === todayStr);
  if (todaysEvents.length === 0) {
    reminderList.innerHTML = '<div class="empty-state"><p>No reminders for today.</p></div>';
    return;
  }
  todaysEvents.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  reminderList.innerHTML = todaysEvents.map(event => `
    <div class="reminder-item">
      <span class="reminder-time">${formatTime(event.timeStart)}</span>
      <span class="reminder-text">${event.title}</span>
    </div>
  `).join('');
};

// ---------- Archive Management Functions ----------
const renderArchive = () => {
  const archiveList = document.querySelector('.archive-list');
  if (!archiveList) return;
  const monthSelect = document.getElementById('archiveMonth');
  const selectedMonth = monthSelect ? monthSelect.value : 'february';

  const completedTasksWithProjects = tasks.filter(task => task.completed).map(task => {
    const project = projects.find(p => p.id === task.projectId);
    return { ...task, projectTitle: project ? project.title : 'No Project' };
  });

  let archivedTasks;
  if (selectedMonth === 'january') {
    archivedTasks = [
      { id: 'a1', title: 'Create project proposal', completedAt: '2025-01-10T14:22:00Z', projectTitle: "Website Redesign" },
      { id: 'a2', title: 'Research competitors', completedAt: '2025-01-10T11:05:00Z', projectTitle: "Website Redesign" },
      { id: 'a3', title: 'Team onboarding', completedAt: '2025-01-12T16:30:00Z', projectTitle: "Website Redesign" },
      { id: 'a4', title: 'Budget planning', completedAt: '2025-01-15T09:45:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a5', title: 'Client meeting', completedAt: '2025-01-18T13:20:00Z', projectTitle: "Annual Marketing Plan" }
    ];
  } else if (selectedMonth === 'previous') {
    archivedTasks = [
      { id: 'a6', title: 'Annual report', completedAt: '2024-12-20T15:40:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a7', title: 'Holiday planning', completedAt: '2024-12-15T10:10:00Z', projectTitle: "Product Launch" },
      { id: 'a8', title: 'Performance reviews', completedAt: '2024-12-10T11:30:00Z', projectTitle: "Product Launch" }
    ];
  } else {
    archivedTasks = completedTasksWithProjects.length > 0 ? completedTasksWithProjects : [
      { id: 'a9', title: 'Complete quarterly report draft', completedAt: '2025-02-24T16:32:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a10', title: 'Schedule team meeting', completedAt: '2025-02-24T14:15:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a11', title: 'Review website mockups', completedAt: '2025-02-23T17:45:00Z', projectTitle: "Website Redesign" },
      { id: 'a12', title: 'Send invoice to client', completedAt: '2025-02-23T11:20:00Z', projectTitle: "Website Redesign" },
      { id: 'a13', title: 'Order office supplies', completedAt: '2025-02-23T09:05:00Z', projectTitle: "Product Launch" }
    ];
  }

  // Apply archive filter from UI
  const archiveFilterElem = document.querySelector('#archive-content .filter-option.active');
  const archiveFilter = archiveFilterElem ? archiveFilterElem.textContent.trim().toLowerCase() : 'all tasks';
  if (archiveFilter === 'high priority') {
    archivedTasks = archivedTasks.filter(task => task.priority === 'high');
  } else if (archiveFilter === 'project-related') {
    archivedTasks = archivedTasks.filter(task => task.projectTitle && task.projectTitle !== 'No Project');
  }

  const tasksByDate = {};
  archivedTasks.forEach(task => {
    const date = new Date(task.completedAt).toISOString().split('T')[0];
    if (!tasksByDate[date]) tasksByDate[date] = [];
    tasksByDate[date].push(task);
  });

  const sortedDates = Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a));
  const summaryNumbers = document.querySelectorAll('.summary-number');
  if (summaryNumbers && summaryNumbers.length >= 3) {
    summaryNumbers[0].textContent = archivedTasks.length;
    summaryNumbers[1].textContent = selectedMonth === 'january' ? '85%' : selectedMonth === 'february' ? '87%' : '82%';
    const uniqueProjects = new Set();
    archivedTasks.forEach(task => { if (task.projectTitle && task.projectTitle !== 'No Project') uniqueProjects.add(task.projectTitle); });
    summaryNumbers[2].textContent = uniqueProjects.size;
  }

  let archiveHTML = '';
  sortedDates.forEach(date => {
    const formattedDate = formatDateLong(date);
    archiveHTML += `<div class="archive-date-header">${formattedDate}</div>`;
    const sortedTasks = tasksByDate[date].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    sortedTasks.forEach(task => {
      const timeStr = formatTime(new Date(task.completedAt).toTimeString().substring(0, 5));
      archiveHTML += `
        <div class="archive-item">
          <div class="archive-item-check">✓</div>
          <div class="archive-item-text">
            ${task.title} <span class="archive-project">(${task.projectTitle})</span>
          </div>
          <div class="archive-item-time">${timeStr}</div>
        </div>
      `;
    });
  });
  archiveHTML = archiveHTML === ''
    ? '<div class="empty-state"><p>No archived tasks for this period.</p></div>'
    : archiveHTML;
  archiveList.innerHTML = archiveHTML;
  updateArchiveChart(selectedMonth);
};

const updateArchiveChart = (month) => {
  const chartBars = document.querySelectorAll('.chart-bar-fill');
  if (!chartBars || chartBars.length === 0) return;
  let data;
  if (month === 'january') data = [40, 55, 35, 60, 70];
  else if (month === 'previous') data = [30, 45, 65, 35, 50];
  else data = [60, 80, 45, 70, 90];
  chartBars.forEach((bar, index) => bar.style.height = `${data[index]}%`);
};

const downloadArchiveData = () => {
  const monthSelect = document.getElementById('archiveMonth');
  const selectedMonth = monthSelect ? monthSelect.value : 'february';
  const completedTasksWithProjects = tasks.filter(task => task.completed).map(task => {
    const project = projects.find(p => p.id === task.projectId);
    return { ...task, projectTitle: project ? project.title : 'No Project' };
  });

  let archivedTasks;
  if (selectedMonth === 'january') {
    archivedTasks = [
      { id: 'a1', title: 'Create project proposal', completedAt: '2025-01-10T14:22:00Z', projectTitle: "Website Redesign" },
      { id: 'a2', title: 'Research competitors', completedAt: '2025-01-10T11:05:00Z', projectTitle: "Website Redesign" },
      { id: 'a3', title: 'Team onboarding', completedAt: '2025-01-12T16:30:00Z', projectTitle: "Website Redesign" },
      { id: 'a4', title: 'Budget planning', completedAt: '2025-01-15T09:45:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a5', title: 'Client meeting', completedAt: '2025-01-18T13:20:00Z', projectTitle: "Annual Marketing Plan" }
    ];
  } else if (selectedMonth === 'previous') {
    archivedTasks = [
      { id: 'a6', title: 'Annual report', completedAt: '2024-12-20T15:40:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a7', title: 'Holiday planning', completedAt: '2024-12-15T10:10:00Z', projectTitle: "Product Launch" },
      { id: 'a8', title: 'Performance reviews', completedAt: '2024-12-10T11:30:00Z', projectTitle: "Product Launch" }
    ];
  } else {
    archivedTasks = completedTasksWithProjects.length > 0 ? completedTasksWithProjects : [
      { id: 'a9', title: 'Complete quarterly report draft', completedAt: '2025-02-24T16:32:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a10', title: 'Schedule team meeting', completedAt: '2025-02-24T14:15:00Z', projectTitle: "Annual Marketing Plan" },
      { id: 'a11', title: 'Review website mockups', completedAt: '2025-02-23T17:45:00Z', projectTitle: "Website Redesign" },
      { id: 'a12', title: 'Send invoice to client', completedAt: '2025-02-23T11:20:00Z', projectTitle: "Website Redesign" },
      { id: 'a13', title: 'Order office supplies', completedAt: '2025-02-23T09:05:00Z', projectTitle: "Product Launch" }
    ];
  }

  const tasksByDate = {};
  archivedTasks.forEach(task => {
    const date = new Date(task.completedAt).toISOString().split('T')[0];
    if (!tasksByDate[date]) tasksByDate[date] = [];
    tasksByDate[date].push(task);
  });
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a));
  let csvContent = "Date,Time,Task,Project\n";
  sortedDates.forEach(date => {
    const sortedTasks = tasksByDate[date].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    sortedTasks.forEach(task => {
      const timeStr = formatTime(new Date(task.completedAt).toTimeString().substring(0, 5));
      const formattedDate = formatDate(date);
      const taskTitleEscaped = task.title.replace(/"/g, '""');
      const projectTitleEscaped = task.projectTitle.replace(/"/g, '""');
      csvContent += `"${formattedDate}","${timeStr}","${taskTitleEscaped}","${projectTitleEscaped}"\n`;
    });
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `task_harvest_${selectedMonth}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ---------- UI Interaction Functions ----------
const handleQuickAdd = () => {
  if (!quickAddTask) return;
  const title = quickAddTask.value.trim();
  if (!title) return;
  addTask({
    title,
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'other',
    repeat: 'none',
    completed: false
  });
  quickAddTask.value = '';
};

const openAddTaskModal = () => {
  if (!taskForm || !taskId || !modalTitle) return;
  taskForm.reset();
  taskId.value = '';
  modalTitle.textContent = 'ADD NEW TASK';
  priorityOptions.forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.priority === 'medium') opt.classList.add('selected');
  });
  selectedPriority = 'medium';
  selectedProject = null;
  if (taskProject) taskProject.value = '';
  taskModal && (taskModal.style.display = 'flex');
};

const openEditTaskModal = (id) => {
  if (!taskTitle || !taskDescription || !dueDate || !taskCategory || !taskRepeat || !modalTitle || !taskId) return;
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  taskId.value = task.id;
  taskTitle.value = task.title;
  taskDescription.value = task.description || '';
  dueDate.value = task.dueDate || '';
  taskCategory.value = task.category || 'other';
  taskRepeat.value = task.repeat || 'none';
  priorityOptions.forEach(opt => {
    opt.classList.remove('selected');
    if (opt.dataset.priority === task.priority) opt.classList.add('selected');
  });
  selectedPriority = task.priority;
  selectedProject = task.projectId;
  if (taskProject) taskProject.value = task.projectId || '';
  modalTitle.textContent = 'EDIT TASK';
  taskModal && (taskModal.style.display = 'flex');
};

const closeTaskModal = () => {
  taskModal && (taskModal.style.display = 'none');
};

const handleTaskFormSubmit = (e) => {
  e && e.preventDefault();
  if (!taskId || !taskTitle) return;
  const id = taskId.value;
  const title = taskTitle.value.trim();
  if (!title) {
    alert("Task title is required");
    return;
  }
  const newTask = {
    title,
    description: taskDescription.value.trim(),
    dueDate: dueDate.value,
    priority: selectedPriority,
    category: taskCategory.value,
    repeat: taskRepeat.value,
    projectId: selectedProject,
    completed: id ? tasks.find(t => t.id === id)?.completed || false : false
  };
  id ? updateTask(id, newTask) : addTask(newTask);
  closeTaskModal();
};

const renderTasks = () => {
  if (!taskList) return;
  let filteredTasks = [];
  switch (currentFilter) {
    case 'all':
      filteredTasks = tasks;
      break;
    case 'active':
      filteredTasks = tasks.filter(t => !t.completed);
      break;
    case 'completed':
      filteredTasks = tasks.filter(t => t.completed);
      break;
  }
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '';
    emptyState && (emptyState.style.display = 'block');
    return;
  }
  emptyState && (emptyState.style.display = 'none');
  taskList.innerHTML = filteredTasks.map(task => {
    const dueDateFormatted = task.dueDate ? formatDate(task.dueDate) : '';
    const project = projects.find(p => p.id === task.projectId);
    const projectTitle = project ? project.title : 'No Project';
    return `
      <li class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-id="${task.id}">
        <div class="task-content">
          <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskComplete('${task.id}')"></div>
          <div class="task-text">
            <div class="task-title" onclick="toggleTaskDetails('${task.id}')">${task.title}</div>
            <div class="task-meta">
              ${dueDateFormatted ? `<span>Due: ${dueDateFormatted}</span>` : ''}
              ${task.category ? `<span>${task.category}</span>` : ''}
              ${task.repeat !== 'none' ? `<span>Repeats: ${task.repeat}</span>` : ''}
              <span>Project: ${projectTitle}</span>
            </div>
            <div class="task-details">
              ${task.description || 'No additional details provided.'}
            </div>
          </div>
          <div class="task-actions">
            <button class="task-btn" onclick="openEditTaskModal('${task.id}')">Edit</button>
            <button class="task-btn" onclick="deleteTask('${task.id}')">Delete</button>
          </div>
        </div>
      </li>
    `;
  }).join('');
};

const updateProgressStats = () => {
  if (!progressBar || !progressPercent || !todayCompleted || !totalCompleted) return;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCompletedCount = tasks.filter(t => {
    if (!t.completed) return false;
    const dateToCheck = t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt);
    return dateToCheck >= today;
  }).length;
  if (totalTasks === 0) {
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
  } else {
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    progressBar.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
  }
  todayCompleted.textContent = todayCompletedCount;
  totalCompleted.textContent = completedTasks;
};

const updateProjectDropdown = () => {
  if (!taskProject) return;
  taskProject.innerHTML = `
    <option value="">No Project</option>
    ${projects.map(project => `<option value="${project.id}">${project.title}</option>`).join('')}
  `;
  taskProject.addEventListener('change', () => {
    selectedProject = taskProject.value !== "" ? taskProject.value : null;
  });
};

// ---------- Global Functions for Inline Handlers ----------
window.toggleTaskComplete = toggleTaskComplete;
window.deleteTask = deleteTask;
window.toggleTaskDetails = toggleTaskDetails;
window.openEditTaskModal = openEditTaskModal;
window.openEditProjectModal = openEditProjectModal;
window.deleteProject = deleteProject;
window.openEditEventModal = openEditEventModal;
window.deleteEvent = deleteEvent;
window.openAddEventModalWithDate = openAddEventModalWithDate;

// ---------- Initialize the Application ----------
document.addEventListener('DOMContentLoaded', initApp);
