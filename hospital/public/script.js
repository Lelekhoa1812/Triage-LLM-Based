/* File: hospital/public/script.js */
/* --------------------------------------------------------------------------
   DOM nodes
--------------------------------------------------------------------------- */
const dispatchList = document.getElementById('dispatchList');
const toast        = document.getElementById('toast');

/* --------------------------------------------------------------------------
   Client‑side state
--------------------------------------------------------------------------- */
const localDispatches = new Map();   // id → DOM card
let undoCache = null;                // last archived card for undo

/* --------------------------------------------------------------------------
   Poll backend every 5 s for new / updated dispatches
--------------------------------------------------------------------------- */
setInterval(pollDispatches, 5000);
pollDispatches(); // first run immediately

function pollDispatches() {
  fetch('/api/dispatch')
    .then(res => (res.status === 204 ? null : res.json()))
    .then(dispatchArray => {
      if (!dispatchArray) return;

      dispatchArray.forEach(d => {
        // ignore if card already created
        if (!localDispatches.has(d.id)) {
          const card = createCard(d);
          localDispatches.set(d.id, card);
          dispatchList.appendChild(card);
        }
      });
      sortCards();
    })
    .catch(err => console.error('Fetch error:', err));
}

/* --------------------------------------------------------------------------
   Card creation
--------------------------------------------------------------------------- */
function createCard(d) {
  const card = document.createElement('div');
  card.className = 'dispatch-card';
  card.dataset.id = d.id;
  card.dataset.urgency = '';
  // Header block
  const header = document.createElement('div');
  header.className = 'card-header';
  // Top row with name and age
  const topRow = document.createElement('div');
  topRow.className = 'top-row';
  topRow.innerHTML = `
    <h2>${d.profile.Name}</h2>
    <small>${d.profile.Age} years old</small>
  `;
  // Address row
  const address = document.createElement('div');
  address.className = 'address';
  address.textContent = d.profile.Location;
  // Action row
  const actionRow = document.createElement('div');
  actionRow.className = 'action-row';
  // Severity dropdown
  const labelledSelect = document.createElement('div');
  labelledSelect.className = 'labelled';
  labelledSelect.innerHTML = '<span>Severity</span>';
  const select = document.createElement('select');
  select.innerHTML = `
    <option value="">Unlabelled</option>
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
  `;
  select.addEventListener('change', e => {
    updateUrgency(card, e.target.value);
    sortCards();
  });
  labelledSelect.appendChild(select);
  // Toggle details button
  const labelledDetails = document.createElement('div');
  labelledDetails.className = 'labelled';
  labelledDetails.innerHTML = '<span>Toggle</span>';
  const detailsBtn = document.createElement('button');
  detailsBtn.textContent = 'Details';
  detailsBtn.addEventListener('click', () => {
    const open = details.style.display === 'block';
    details.style.display = open ? 'none' : 'block';
    detailsBtn.textContent = open ? 'Details' : 'Hide';
  });
  labelledDetails.appendChild(detailsBtn);
  // Archive button
  const labelledArchive = document.createElement('div');
  labelledArchive.className = 'labelled';
  labelledArchive.innerHTML = '<span>Archive</span>';
  const archiveBtn = document.createElement('button');
  archiveBtn.textContent = 'Archive';
  archiveBtn.addEventListener('click', () => archiveCard(d.id, card));
  labelledArchive.appendChild(archiveBtn);
  // Append items
  actionRow.append(labelledSelect, labelledDetails, labelledArchive);
  // Details
  const details = document.createElement('div');
  details.className = 'details';
  details.innerHTML = renderDetails(d);
  // Compose all
  header.append(topRow, address, actionRow);
  card.append(header, details);
  return card;
}


/* --------------------------------------------------------------------------
   Urgency handling + colour
--------------------------------------------------------------------------- */
function updateUrgency(card, urgency) {
  card.dataset.urgency = urgency || '';
  card.classList.remove('urgency-high', 'urgency-medium', 'urgency-low');
  if (urgency === 'High')   card.classList.add('urgency-high');
  if (urgency === 'Medium') card.classList.add('urgency-medium');
  if (urgency === 'Low')    card.classList.add('urgency-low');
}

/* --------------------------------------------------------------------------
   Sorting: white → red → yellow → green
--------------------------------------------------------------------------- */
function sortCards() {
  const order = { '': 0, High: 1, Medium: 2, Low: 3 };
  const cards = Array.from(dispatchList.children);
  cards.sort((a, b) => {
    const u1 = a.dataset.urgency, u2 = b.dataset.urgency;
    const delta = order[u1] - order[u2];
    return delta !== 0 ? delta : (a.dataset.id < b.dataset.id ? -1 : 1);
  });
  cards.forEach(c => dispatchList.appendChild(c));
}

/* --------------------------------------------------------------------------
   Archive / undo
--------------------------------------------------------------------------- */
function archiveCard(id, card) {
  undoCache = { id, card, idx: Array.from(dispatchList.children).indexOf(card) };
  card.remove();
  showToast('Dispatch archived', undo);
}
function undo() {
  if (!undoCache) return;
  const { card, idx } = undoCache;
  const children = Array.from(dispatchList.children);
  if (idx >= children.length) dispatchList.appendChild(card);
  else dispatchList.insertBefore(card, children[idx]);
  undoCache = null;
}

/* --------------------------------------------------------------------------
   Toast helper
--------------------------------------------------------------------------- */
function showToast(message, undoCb) {
  toast.innerHTML = `${message}${undoCb ? ' <button>Undo</button>' : ''}`;
  toast.classList.add('show');
  if (undoCb) toast.querySelector('button').onclick = () => { undoCb(); toast.classList.remove('show'); };
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* --------------------------------------------------------------------------
   Detail rendering helpers
--------------------------------------------------------------------------- */
function renderDetails(d) {
  return `
    ${formatProfile(d.profile)}
    ${formatList('📝 Emergency Highlights', d.highlights)}
    ${formatList('📋 Recommended Actions', d.recommendations)}
    ${formatList('💊 Suggested Medications', d.medications)}
  `;
}
function formatProfile(p) {
  if (!p) return '<i>No profile data.</i>';
  return `
    <h3>Patient Profile</h3>
    <ul>
      <li><strong>Name:</strong> ${p.Name}</li>
      <li><strong>Age:</strong> ${p.Age}</li>
      <li><strong>Blood Type:</strong> ${p['Blood Type']}</li>
      <li><strong>Allergies:</strong> ${p.Allergies}</li>
      <li><strong>History:</strong> ${p.History}</li>
      <li><strong>Medication:</strong> ${p.Meds}</li>
      <li><strong>Disability:</strong> ${p.Disability}</li>
      <li><strong>Emergency Contact:</strong> ${p['Emergency Contact']}</li>
      <li><strong>Location:</strong> ${p.Location}</li>
    </ul>
  `;
}
function formatList(title, arr) {
  if (!arr || arr.length === 0) return '';
  return `
    <h3>${title}</h3>
    <ul>${arr.map(i => `<li>${i}</li>`).join('')}</ul>
  `;
}
