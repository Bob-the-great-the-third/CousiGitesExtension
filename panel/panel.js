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

  data.sort((a, b) => b.duration?.value - a.duration?.value);

  let id_counter = 0;
  data.forEach(item => {

    const loc = item.location?.location ? item.location: item;
    const div_id = id_counter + "-" + loc.location;
    id_counter++;

    const div = document.createElement('div');
    div.className = 'json-item';
    div.id = div_id;
    
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.type = 'button';               // prevents submitting a form
    btn.textContent = 'X';             // safe text
    
    btn.addEventListener('click', async () => {
      // Upon deletion, since most of the code uses the json object to remove all object that have the same value but removal 
      // from the web page is done through a unique id. 
      // There is an edge case where, with two identic initial locations in the panel, the two are removed from: cache and local
      // chrome storage while the web panel only removes one of the two.
      // Could be prevented by providing a unique id to the location data structure, but, doesn't really matter, at least for now. 

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab) return console.error('No active tab found');
        chrome.tabs.sendMessage(tab.id, loc);
      });

      const elt_to_remove = document.getElementById(div_id);
      elt_to_remove.parentNode.removeChild(elt_to_remove);
    });

    const nom = document.createElement('span');
    nom.className = 'nom';
    nom.textContent = loc.location;

    const temps = document.createElement('span');
    temps.className = 'temps';
    temps.textContent = item.duration?.text ?? '...h...';

    div.append(btn, nom, temps);
    container.appendChild(div);

  });

  // data.forEach(item => {
  //   const div = document.createElement("div");
  //   div.className = "json-item";
  //   div.innerHTML = `
  //     <button id="" onclick="window.LOCATION_HANDLING.remove_location(${item.location.location || item.location})" class="delete-btn">X</button>
  //     <span class="nom">${item.location.location || item.location}</span>
  //     <span class="temps">${item.duration?.text || "...h..."}</span>
  //   `;
  //   container.appendChild(div);

  //   // if(maxTime.value<item.duration?.value)
  //     // maxTime=item.duration;
  // });

  // console.log(maxTime)

  // const maxTimeDom = document.getElementById("max-time");
  // maxTimeDom.innerHTML = `
  //   <h4>Temps maximal -> ${maxTime.text}</h4>
  // `;
}