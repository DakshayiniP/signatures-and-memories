const SUPABASE_URL = "https://iybcmvbfxoylttvargxf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_U_Ldrq1LbNzY9JW_IMpTAA_7p1ETh6P";

let entries = [];
let currentFilter = "all";

const emoji = {
  heartfelt: "❤️",
  funny: "😂",
  advice: "🚀"
};

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(x => x[0])
    .join("")
    .toUpperCase();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

function render() {
  const wall = document.getElementById("wall");

  const list = entries.filter(
    x => currentFilter === "all" || x.vibe === currentFilter
  );

  wall.innerHTML =
    list.map(x => `
      <article class="card">
        <div class="top">
          <div class="avatar">${initials(x.name)}</div>

          <div class="person">
            <strong>${escapeHtml(x.name)}</strong>
            <small>${escapeHtml(x.team || "Walmart")}</small>
          </div>

          <div class="badge">${emoji[x.vibe] || "♥"}</div>
        </div>

        <div class="message">
          ${escapeHtml(x.message).replace(/\n/g, "<br>")}
        </div>

        ${
          x.photo_url
            ? `<img class="photo" src="${escapeHtml(x.photo_url)}" alt="Shared memory">`
            : ""
        }
      </article>
    `).join("") ||
    `<div class="card">
      <strong>No memories here yet.</strong>
      <div class="message">Be the first to leave one. ♥</div>
    </div>`;

  document.getElementById("messageCount").textContent = entries.length;

  document.getElementById("photoCount").textContent =
    entries.filter(x => x.photo_url).length;
}

async function loadMemories() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/memories?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error("Could not load memories");
    }

    entries = await response.json();
    render();

  } catch (error) {
    console.error("Failed to load memories:", error);

    document.getElementById("wall").innerHTML = `
      <div class="card">
        <strong>Unable to load memories right now.</strong>
        <div class="message">
          Please refresh the page and try again.
        </div>
      </div>
    `;
  }
}

async function uploadPhoto(file) {
  if (!file) return "";

  const extension =
    file.name.split(".").pop().toLowerCase() || "jpg";

  const fileName =
    `${crypto.randomUUID()}.${extension}`;

  const uploadResponse = await fetch(
    `${SUPABASE_URL}/storage/v1/object/memory-photos/${fileName}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    }
  );

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("Photo upload failed:", errorText);
    throw new Error("Photo upload failed");
  }

  return `${SUPABASE_URL}/storage/v1/object/public/memory-photos/${fileName}`;
}

async function submitMemory(item) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/memories`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(item)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Memory submission failed:", errorText);
    throw new Error("Memory submission failed");
  }
}

function openModal() {
  document.getElementById("modal").classList.add("open");
  document.getElementById("name").focus();
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    render();
  });
});

document.getElementById("modal").addEventListener("click", event => {
  if (event.target.id === "modal") {
    closeModal();
  }
});

document
  .getElementById("autographForm")
  .addEventListener("submit", async event => {

    event.preventDefault();

    const status = document.getElementById("status");
    const file = document.getElementById("photo").files[0];

    /*
      Maximum photo size: 5 MB
    */
    if (file && file.size > 5 * 1024 * 1024) {
      status.textContent =
        "Please choose an image smaller than 5 MB.";
      return;
    }

    const name =
      document.getElementById("name").value.trim();

    const team =
      document.getElementById("team").value.trim();

    const message =
      document.getElementById("message").value.trim();

    const vibe =
      document.getElementById("vibe").value;

    if (!name || !message) {
      status.textContent =
        "Please add your name and message.";
      return;
    }

    status.textContent =
      "Adding your autograph… ✨";

    try {

      let photoUrl = "";

      if (file) {
        status.textContent =
          "Uploading your photo… 📸";

        photoUrl = await uploadPhoto(file);
      }

      const item = {
        name,
        team,
        message,
        vibe,
        photo_url: photoUrl
      };

      await submitMemory(item);

      status.textContent =
        "Thank you! Your autograph is on the wall. ❤️";

      /*
        Reload the shared data from Supabase.
        This means everyone sees the same memories.
      */
      await loadMemories();

      setTimeout(() => {
        document
          .getElementById("autographForm")
          .reset();

        closeModal();

        status.textContent = "";
      }, 900);

    } catch (error) {

      console.error(error);

      status.textContent =
        "Something went wrong. Please try again.";
    }
  });

loadMemories();
