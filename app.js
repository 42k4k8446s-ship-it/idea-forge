// app.js
const ideaInput = document.querySelector("#ideaInput");
const categoryInput = document.querySelector("#categoryInput");
const addBtn = document.querySelector("#addBtn");
const randomBtn = document.querySelector("#randomBtn");
const ideaList = document.querySelector("#ideaList");
const ideaCount = document.querySelector("#ideaCount");
const randomResult = document.querySelector("#randomResult");

let ideas = JSON.parse(localStorage.getItem("idea-forge")) || [];

function saveIdeas() {
  localStorage.setItem("idea-forge", JSON.stringify(ideas));
}

function renderIdeas() {
  ideaList.innerHTML = "";
  ideaCount.textContent = ideas.length;

  if (ideas.length === 0) {
    ideaList.innerHTML = `
      <p class="empty">目前還沒有 Idea，先新增第一個吧。</p>
    `;
    return;
  }

  ideas.forEach((idea) => {
    const card = document.createElement("article");
    card.className = "idea-card";

    card.innerHTML = `
      <small>${idea.category}</small>
      <h3>${idea.text}</h3>
      <button class="want-btn ${idea.wantToBuild ? "active" : ""}">
        ${idea.wantToBuild ? "✓ 想做" : "標記想做"}
      </button>
    `;

    card.querySelector(".want-btn").addEventListener("click", () => {
      idea.wantToBuild = !idea.wantToBuild;
      saveIdeas();
      renderIdeas();
    });

    ideaList.appendChild(card);
  });
}

function addIdea() {
  const text = ideaInput.value.trim();

  if (!text) return;

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
  if (ideas.length === 0) return;

  const randomIndex = Math.floor(Math.random() * ideas.length);
  const idea = ideas[randomIndex];

  randomResult.textContent = `🎲 ${idea.text}`;
  randomResult.classList.remove("hidden");
}

addBtn.addEventListener("click", addIdea);
randomBtn.addEventListener("click", pickRandomIdea);

ideaInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addIdea();
  }
});

renderIdeas();