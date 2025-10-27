window.addEventListener('message', (event) => {
  if (event.data?.type === 'data') {
    renderJsonList(event.data.payload)
  }
});

// document.addEventListener('DOMContentLoaded', function () {
//   document.getElementById('popupOverlay').addEventListener('click', (e) => {
//     if (e.target.id === 'popupOverlay') {
//       document.getElementById('popupOverlay').style.display = 'none';
//     }
//   });

//   document.getElementById('openPopupBtn').addEventListener('click', () => {
//     document.getElementById('popupOverlay').style.display = 'flex';
//   });

//   document.getElementById('submitBtn').addEventListener('click', () => {
//     const LOC = document.getElementById("name")
//     const X = document.getElementById("x")
//     const Y = document.getElementById("y")

//     window.LOCATION_HANDLING.add_location({
//       "location": LOC,
//       "x": X,
//       "y": X
//     })

//     document.getElementById('popupOverlay').style.display = 'none';
//   });

// })



function renderJsonList(data) {
  const container = document.getElementById("json-container");
  if (!container)
    console.error("erreur")
  container.innerHTML = ""; // Clear previous content
  
  data.sort((a,b) => b.duration?.value - a.duration?.value);

  // let maxTime = data[0].duration;
  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "json-item";
    div.innerHTML = `
      <button id="" onclick="window.LOCATION_HANDLING.remove_location(${item.location.location || item.location})" class="delete-btn">X</button>
      <span class="nom">${item.location.location || item.location}</span>
      <span class="temps">${item.duration?.text || "...h..."}</span>
    `;
    container.appendChild(div);
    
    // if(maxTime.value<item.duration?.value)
      // maxTime=item.duration;
  });

  // console.log(maxTime)

  // const maxTimeDom = document.getElementById("max-time");
  // maxTimeDom.innerHTML = `
  //   <h4>Temps maximal -> ${maxTime.text}</h4>
  // `;
}

// async function remove_location(location) {
  // await window.LOCATION_HANDLING.remove_location(location)
// }
