const ideaInput = document.querySelector("#ideaInput");
const categoryInput = document.querySelector("#categoryInput");
const addBtn = document.querySelector("#addBtn");
const randomBtn = document.querySelector("#randomBtn");
const ideaList = document.querySelector("#ideaList");
const ideaCount = document.querySelector("#ideaCount");
const randomResult = document.querySelector("#randomResult");
const filterButtons = document.querySelectorAll(".filter-btn");
const favoriteOnly = document.querySelector("#favoriteOnly");
const clearAllBtn = document.querySelector("#clearAllBtn");
const filterStatus = document.querySelector("#filterStatus");

let ideas = JSON.parse(localStorage.getItem("idea-forge")) || [];
let activeCategory = "All";

function saveIdeas() {
  localStorage.setItem("idea-forge", JSON.stringify(ideas));
}

function getFilteredIdeas() {
  return ideas.filter((idea) => {
    const categoryMatches =
      activeCategory === "All" || idea.category === activeCategory;

    const favoriteMatches =
      !favoriteOnly.checked || idea.wantToBuild;

    return categoryMatches && favoriteMatches;
  });
}

function updateFilterStatus(filteredIdeas) {
  const categoryText =
    activeCategory === "All"
      ? "全部分類"
      : activeCategory;

  const favoriteText =
    favoriteOnly.checked
      ? " / 只看想做"
      : "";

  filterStatus.textContent =
    `${categoryText}${favoriteText} · ${filteredIdeas.length} 筆`;
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

    const category = document.createElement("small");
    category.textContent = idea.category;

    const title = document.createElement("h3");
    title.textContent = idea.text;

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

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "刪除";

    deleteButton.addEventListener("click", () => {
      ideas = ideas.filter(
        (currentIdea) => currentIdea.id !== idea.id
      );

      saveIdeas();
      renderIdeas();
    });

    actions.append(wantButton, deleteButton);
    card.append(category, title, actions);

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
    wantToBuild: false
  });

  ideaInput.value = "";

  saveIdeas();
  renderIdeas();
}

function pickRandomIdea() {
  const filteredIdeas = getFilteredIdeas();

  if (filteredIdeas.length === 0) {
    randomResult.textContent = "目前沒有可以抽選的 Idea。";
    randomResult.classList.remove("hidden");
    return;
  }

  const randomIndex =
    Math.floor(Math.random() * filteredIdeas.length);

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