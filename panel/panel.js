window.addEventListener('message', (event) => {
  console.log("panel.js just received")
  console.log(event.data)
  if (event.data?.type === 'data') {
    renderJsonList(event.data.payload.timings)
    sick_n_cant_think_how_to_implement_this_well(event.data.payload.total_requests_counter)
  }
});

document.addEventListener('DOMContentLoaded', function () {

  document.getElementById('popupOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'popupOverlay') {
      document.getElementById('popupOverlay').style.display = 'none';
    }
  });

  document.getElementById('add-button').addEventListener('click', () => {
    document.getElementById('popupOverlay').style.display = 'flex';
  });

  document.getElementById('submitBtn').addEventListener('click', () => {
    const LOC = document.getElementById("name")
    const X = document.getElementById("x")
    const Y = document.getElementById("y")

    send_msg_to_extension(msg = {
      destination: "content",
      objective: "ADD_LOCATION",
      data: {
        location: LOC.value,
        x: X.value,
        y: Y.value
      }
    })

    document.getElementById('popupOverlay').style.display = 'none';
  });
})

function sick_n_cant_think_how_to_implement_this_well(counter) {
  const h_counter_tag = document.getElementById("total-request-counter");

  h_counter_tag.textContent = "Total request count: " + counter;
}

function renderJsonList(data) {
  const container = document.getElementById("json-container");
  if (!container)
    console.error("erreur")

  container.innerHTML = ""; // Clear previous content

  data.sort((a, b) => b.duration?.value - a.duration?.value);

  let id_counter = 0;
  data.forEach(item => {

    const loc = item.location?.location ? item.location : item;
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

      send_msg_to_extension(msg = {
        destination: "content",
        objective: "REMOVE_LOCATION",
        data: loc,
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


  send_msg_to_extension()
}

function send_msg_to_extension(msg = undefined, update_size = true) {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async (tabs) => {
      const tab = tabs[0];
      if (!tab) return console.error('No active tab found');

      if (msg)
        await chrome.tabs.sendMessage(tab.id, msg);

      if (update_size)
        await chrome.tabs.sendMessage(tab.id, {
          destination: "content",
          objective: "ADJUST_PANEL_HEIGHT",
          data: document.body.scrollHeight
        })
    })
}
