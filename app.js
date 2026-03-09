const DAY_START = 10;
const DAY_END = 22;
const HOUR_HEIGHT = 52;

const categoryStyles = {
  chores: "var(--chores)",
  sports: "var(--sports)",
  study: "var(--study)",
  friends: "var(--friends)",
  fun: "var(--fun)",
};

const defaultDurations = {
  chores: 1,
  sports: 1.5,
  study: 1.5,
  friends: 2,
  fun: 1.5,
};

const activityTemplates = [
  { title: "Room Cleanup", category: "chores" },
  { title: "Help at Home", category: "chores" },
  { title: "Volleyball Practice", category: "sports" },
  { title: "Tennis Practice", category: "sports" },
  { title: "Math Study", category: "study" },
  { title: "English Study", category: "study" },
  { title: "Hangout with Friends", category: "friends" },
  { title: "Evening Walk + Chill", category: "fun" },
];

const state = {
  schedule: [
    { id: crypto.randomUUID(), title: "Volleyball Practice", category: "sports", dayIndex: 0, start: 10.5, duration: 1.5 },
    { id: crypto.randomUUID(), title: "Math Study", category: "study", dayIndex: 0, start: 13, duration: 1.5 },
    { id: crypto.randomUUID(), title: "Hangout with Friends", category: "friends", dayIndex: 0, start: 18, duration: 2 },
    { id: crypto.randomUUID(), title: "Tennis Practice", category: "sports", dayIndex: 2, start: 11, duration: 1.5 },
    { id: crypto.randomUUID(), title: "English Study", category: "study", dayIndex: 3, start: 14, duration: 1.5 },
    { id: crypto.randomUUID(), title: "Room Cleanup", category: "chores", dayIndex: 4, start: 10, duration: 1 },
    { id: crypto.randomUUID(), title: "Hangout with Friends", category: "friends", dayIndex: 5, start: 19, duration: 2.5 },
  ],
};

const plannerScroll = document.getElementById("planner-scroll");
const activityBank = document.getElementById("activity-bank");
const customForm = document.getElementById("custom-activity-form");
const autoFillButton = document.getElementById("auto-fill-btn");
const bankTemplate = document.getElementById("bank-item-template");
const dayTemplate = document.getElementById("day-column-template");

const days = makeDays();

init();

function init() {
  renderBank();
  renderPlanner();
  bindCustomForm();
  bindAutoFill();
}

function makeDays() {
  const year = 2026;
  const monthIndex = 2;
  const daysList = [];

  for (let day = 10; day <= 19; day += 1) {
    const date = new Date(year, monthIndex, day);
    daysList.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  return daysList;
}

function renderBank() {
  activityBank.innerHTML = "";

  activityTemplates.forEach((item) => {
    const node = bankTemplate.content.firstElementChild.cloneNode(true);
    node.textContent = item.title;
    node.style.background = categoryStyles[item.category];
    node.dataset.title = item.title;
    node.dataset.category = item.category;

    node.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/x-template", JSON.stringify(item));
    });

    activityBank.appendChild(node);
  });
}

function renderPlanner() {
  plannerScroll.innerHTML = "";

  days.forEach((day, dayIndex) => {
    const column = dayTemplate.content.firstElementChild.cloneNode(true);
    const title = column.querySelector("h3");
    const subtitle = column.querySelector("span");
    const timeline = column.querySelector(".timeline");

    column.dataset.dayIndex = String(dayIndex);
    title.textContent = day.label;
    subtitle.textContent = day.date;

    for (let hour = DAY_START; hour <= DAY_END; hour += 1) {
      const timeLabel = document.createElement("span");
      timeLabel.className = "time-label";
      timeLabel.style.top = `${(hour - DAY_START) * HOUR_HEIGHT + 2}px`;
      timeLabel.textContent = formatHour(hour);
      timeline.appendChild(timeLabel);
    }

    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      column.classList.add("is-drop-target");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("is-drop-target");
    });

    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("is-drop-target");

      const movedId = event.dataTransfer.getData("application/x-scheduled");
      const templateData = event.dataTransfer.getData("application/x-template");
      const nextStart = getDropHour(timeline, event.clientY);

      if (movedId) {
        const movingItem = state.schedule.find((item) => item.id === movedId);
        if (!movingItem || !isValidSlot(nextStart, movingItem.duration)) {
          return;
        }

        moveScheduledActivity(movedId, dayIndex, nextStart);
        return;
      }

      if (templateData) {
        const template = JSON.parse(templateData);
        const duration = defaultDurations[template.category] || 1.5;
        if (!isValidSlot(nextStart, duration)) {
          return;
        }

        addScheduledActivity(template.title, template.category, dayIndex, nextStart);
      }
    });

    plannerScroll.appendChild(column);
  });

  state.schedule.forEach((entry) => {
    const targetColumn = plannerScroll.querySelector(`[data-day-index="${entry.dayIndex}"] .timeline`);
    if (!targetColumn) {
      return;
    }

    targetColumn.appendChild(buildBlock(entry));
  });
}

function buildBlock(entry) {
  const block = document.createElement("article");
  block.className = "block";
  block.draggable = true;
  block.style.background = categoryStyles[entry.category];
  block.style.top = `${(entry.start - DAY_START) * HOUR_HEIGHT}px`;
  block.style.height = `${entry.duration * HOUR_HEIGHT - 3}px`;

  block.innerHTML = `
    <button type="button" aria-label="Delete activity">x</button>
    <div>${entry.title}</div>
    <div class="block-time">${formatTimeRange(entry.start, entry.duration)}</div>
  `;

  block.addEventListener("dragstart", (event) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-scheduled", entry.id);
  });

  const deleteButton = block.querySelector("button");
  deleteButton.addEventListener("click", () => {
    state.schedule = state.schedule.filter((item) => item.id !== entry.id);
    renderPlanner();
  });

  return block;
}

function bindCustomForm() {
  customForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(customForm);
    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "");

    if (!title || !categoryStyles[category]) {
      return;
    }

    activityTemplates.push({ title, category });
    renderBank();
    customForm.reset();
  });
}

function addScheduledActivity(title, category, dayIndex, start) {
  const duration = defaultDurations[category] || 1.5;
  if (!isValidSlot(start, duration)) {
    return;
  }

  state.schedule.push({
    id: crypto.randomUUID(),
    title,
    category,
    dayIndex,
    start,
    duration,
  });

  renderPlanner();
}

function moveScheduledActivity(id, dayIndex, start) {
  const target = state.schedule.find((item) => item.id === id);
  if (!target) {
    return;
  }

  if (!isValidSlot(start, target.duration)) {
    return;
  }

  target.dayIndex = dayIndex;
  target.start = start;
  renderPlanner();
}

function getDropHour(timelineElement, clientY) {
  const rect = timelineElement.getBoundingClientRect();
  const relativeY = Math.max(0, Math.min(rect.height, clientY - rect.top));
  const nearestHalfHour = Math.round(relativeY / (HOUR_HEIGHT / 2)) / 2;
  return DAY_START + nearestHalfHour;
}

function isValidSlot(start, duration) {
  return start >= DAY_START && start + duration <= DAY_END;
}

function bindAutoFill() {
  autoFillButton.addEventListener("click", () => {
    const sportsCycle = ["Volleyball Practice", "Tennis Practice"];
    const studyCycle = ["Math Study", "English Study"];

    state.schedule = days.flatMap((_, dayIndex) => {
      const sportsTitle = sportsCycle[dayIndex % sportsCycle.length];
      const studyTitle = studyCycle[dayIndex % studyCycle.length];

      return [
        {
          id: crypto.randomUUID(),
          title: "Room Cleanup",
          category: "chores",
          dayIndex,
          start: 10.5,
          duration: 1,
        },
        {
          id: crypto.randomUUID(),
          title: sportsTitle,
          category: "sports",
          dayIndex,
          start: 12,
          duration: 1.5,
        },
        {
          id: crypto.randomUUID(),
          title: studyTitle,
          category: "study",
          dayIndex,
          start: 14.5,
          duration: 1.5,
        },
        {
          id: crypto.randomUUID(),
          title: "Evening Walk + Chill",
          category: "fun",
          dayIndex,
          start: 16.5,
          duration: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Hangout with Friends",
          category: "friends",
          dayIndex,
          start: 18,
          duration: 2.5,
        },
      ];
    });

    renderPlanner();
  });
}

function formatHour(hour24) {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour = hour24 % 12 || 12;
  return `${hour}${suffix}`;
}

function formatTimeRange(startHour, duration) {
  const endHour = startHour + duration;
  return `${formatHalfHour(startHour)} - ${formatHalfHour(endHour)}`;
}

function formatHalfHour(hourDecimal) {
  const hour = Math.floor(hourDecimal);
  const minutes = Math.round((hourDecimal - hour) * 60);
  const suffix = hour >= 12 ? "PM" : "AM";
  const base = hour % 12 || 12;
  const minuteText = minutes === 0 ? "00" : String(minutes).padStart(2, "0");
  return `${base}:${minuteText} ${suffix}`;
}
