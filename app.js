const ideaInput = document.querySelector("#ideaInput");
const categoryInput = document.querySelector("#categoryInput");
const addBtn = document.querySelector("#addBtn");
const randomBtn = document.querySelector("#randomBtn");
const ideaList = document.querySelector("#ideaList");
const ideaCount = document.querySelector("#ideaCount");
const randomResult = document.querySelector("#randomResult");

const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const favoriteOnly = document.querySelector("#favoriteOnly");
const clearAllBtn = document.querySelector("#clearAllBtn");
const filterStatus = document.querySelector("#filterStatus");

let ideas = JSON.parse(localStorage.getItem("idea-forge")) || [];
let activeCategory = "All";
let editingIdeaId = null;

function saveIdeas() {
  localStorage.setItem("idea-forge", JSON.stringify(ideas));
}

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "舊資料";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "舊資料";
  }

  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getFilteredIdeas() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return ideas.filter((idea) => {
    const categoryMatches =
      activeCategory === "All" ||
      idea.category === activeCategory;

    const favoriteMatches =
      !favoriteOnly.checked ||
      idea.wantToBuild;

    const searchMatches =
      String(idea.text || "")
        .toLowerCase()
        .includes(searchTerm);

    return (
      categoryMatches &&
      favoriteMatches &&
      searchMatches
    );
  });
}

function updateFilterStatus(filteredIdeas) {
  const parts = [];

  if (activeCategory === "All") {
    parts.push("全部分類");
  } else {
    parts.push(activeCategory);
  }

  if (favoriteOnly.checked) {
    parts.push("只看想做");
  }

  if (searchInput.value.trim()) {
    parts.push(`搜尋「${searchInput.value.trim()}」`);
  }

  filterStatus.textContent =
    `${parts.join(" / ")} · ${filteredIdeas.length} 筆`;
}

function createEditForm(idea, card) {
  const form = document.createElement("div");
  form.className = "edit-form";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.value = idea.text || "";

  const categorySelect = document.createElement("select");

  ["Game", "Design", "Video", "Business", "Random"]
    .forEach((categoryName) => {
      const option = document.createElement("option");

      option.value = categoryName;
      option.textContent = categoryName;

      if (categoryName === idea.category) {
        option.selected = true;
      }

      categorySelect.appendChild(option);
    });

  const actions = document.createElement("div");
  actions.className = "edit-actions";

  const saveButton = document.createElement("button");
  saveButton.className = "save-btn";
  saveButton.textContent = "儲存";

  const cancelButton = document.createElement("button");
  cancelButton.className = "cancel-btn";
  cancelButton.textContent = "取消";

  saveButton.addEventListener("click", () => {
    const newText = textInput.value.trim();

    if (!newText) {
      return;
    }

    idea.text = newText;
    idea.category = categorySelect.value;

    editingIdeaId = null;

    saveIdeas();
    renderIdeas();
  });

  cancelButton.addEventListener("click", () => {
    editingIdeaId = null;
    renderIdeas();
  });

  actions.append(saveButton, cancelButton);
  form.append(textInput, categorySelect, actions);
  card.appendChild(form);

  textInput.focus();
}

function renderIdeas() {
  ideaList.innerHTML = "";

  const filteredIdeas = getFilteredIdeas();

  ideaCount.textContent = filteredIdeas.length;
  updateFilterStatus(filteredIdeas);

  if (filteredIdeas.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";

    empty.textContent =
      ideas.length === 0
        ? "目前還沒有 Idea，先新增第一個吧。"
        : "目前篩選條件下沒有符合的 Idea。";

    ideaList.appendChild(empty);
    return;
  }

  filteredIdeas.forEach((idea) => {
    const card = document.createElement("article");
    card.className = "idea-card";

    if (editingIdeaId === idea.id) {
      createEditForm(idea, card);
      ideaList.appendChild(card);
      return;
    }

    const category = document.createElement("small");
    category.textContent = idea.category || "Random";

    const createdAt = document.createElement("small");
    createdAt.textContent =
      `建立：${formatCreatedAt(idea.createdAt)}`;

    const title = document.createElement("h3");
    title.textContent = idea.text || "未命名 Idea";

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const wantButton = document.createElement("button");

    wantButton.className =
      `want-btn ${idea.wantToBuild ? "active" : ""}`;

    wantButton.textContent =
      idea.wantToBuild
        ? "✓ 想做"
        : "標記想做";

    wantButton.addEventListener("click", () => {
      idea.wantToBuild = !idea.wantToBuild;

      saveIdeas();
      renderIdeas();
    });

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "編輯";

    editButton.addEventListener("click", () => {
      editingIdeaId = idea.id;
      renderIdeas();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "刪除";

    deleteButton.addEventListener("click", () => {
      ideas = ideas.filter(
        (currentIdea) => currentIdea.id !== idea.id
      );

      if (editingIdeaId === idea.id) {
        editingIdeaId = null;
      }

      saveIdeas();
      renderIdeas();
    });

    actions.append(
      wantButton,
      editButton,
      deleteButton
    );

    card.append(
      category,
      createdAt,
      title,
      actions
    );

    ideaList.appendChild(card);
  });
}

function addIdea() {
  const text = ideaInput.value.trim();

  if (!text) {
    return;
  }

  ideas.unshift({
    id: crypto.randomUUID(),
    text,
    category: categoryInput.value,
    wantToBuild: false,
    createdAt: new Date().toISOString()
  });

  ideaInput.value = "";

  saveIdeas();
  renderIdeas();
}

function pickRandomIdea() {
  const filteredIdeas = getFilteredIdeas();

  if (filteredIdeas.length === 0) {
    randomResult.textContent =
      "目前沒有可以抽選的 Idea。";

    randomResult.classList.remove("hidden");
    return;
  }

  const randomIndex =
    Math.floor(
      Math.random() * filteredIdeas.length
    );

  const idea = filteredIdeas[randomIndex];

  randomResult.textContent =
    `🎲 ${idea.text}`;

  randomResult.classList.remove("hidden");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    filterButtons.forEach((currentButton) => {
      currentButton.classList.remove("active");
    });

    button.classList.add("active");

    renderIdeas();
  });
});

searchInput.addEventListener("input", renderIdeas);
favoriteOnly.addEventListener("change", renderIdeas);

clearAllBtn.addEventListener("click", () => {
  if (ideas.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    "確定要清空所有 Idea 嗎？這個動作無法復原。"
  );

  if (!confirmed) {
    return;
  }

  ideas = [];
  editingIdeaId = null;

  saveIdeas();

  randomResult.classList.add("hidden");
  renderIdeas();
});

addBtn.addEventListener("click", addIdea);
randomBtn.addEventListener("click", pickRandomIdea);

ideaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addIdea();
  }
});

renderIdeas();