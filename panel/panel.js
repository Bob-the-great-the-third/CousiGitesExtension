window.addEventListener('message', (event) => {
  if (event.data?.type === 'data') {
    renderJsonList(event.data.payload)
  }
});

function renderJsonList(data) {
  const container = document.getElementById("json-container");
  if (!container)
    console.error("erreur")
  container.innerHTML = ""; // Clear previous content

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "json-item";
    div.innerHTML = `
      <button onclick="remove_origin(${item.location.location || item.location})" class="delete-btn">X</button>
      <span class="nom">${item.location.location || item.location}</span>
      <span class="temps">${item.duration?.text || "...h..."}</span>
    `;
    container.appendChild(div);
  });
}

function remove_origin(location) {

}