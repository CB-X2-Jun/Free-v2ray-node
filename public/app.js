let nodes = [];


fetch('https://cb-x2-jun.github.io/Free-v2ray-node/data/nodes.json').then(r => r.json()).then(d => {
nodes = d.filter(n => n.alive);
initFilters();
render();
});


function initFilters() {
const protocols = [...new Set(nodes.map(n => n.protocol))];
const countries = [...new Set(nodes.map(n => n.country))];
protocol.innerHTML = protocols.map(p => `<option>${p}</option>`).join('');
country.innerHTML = countries.map(c => `<option>${c}</option>`).join('');
}

function formatTime(ts) {
  const d = new Date(ts);

  const yy = String(d.getFullYear()).slice(2);
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${yy}/${MM}/${dd} ${hh}:${mm}:${ss}`;
}


function render() {
const ps = [...protocol.selectedOptions].map(o => o.value);
const cs = [...country.selectedOptions].map(o => o.value);


list.innerHTML = nodes.filter(n =>
(!ps.length || ps.includes(n.protocol)) &&
(!cs.length || cs.includes(n.country))
).map(n => `
<tr onclick="show('${encodeURIComponent(n.raw)}')">
<td>${n.protocol}</td>
<td>${n.country}</td>
<td>${n.host}</td>
<td>${n.port}</td>
<td>${formatTime(n.checkedAt)}</td>
</tr>`).join('');
}


protocol.onchange = country.onchange = render;


window.show = raw => {
modal.classList.remove('hidden');
detail.textContent = decodeURIComponent(raw);
}

const modal = document.getElementById('modal');
const detail = document.getElementById('detail');
const closeBtn = document.getElementById('close');
const copyBtn = document.getElementById('copy');

closeBtn.onclick = () => modal.classList.add('hidden');

copyBtn.onclick = () => {
  navigator.clipboard.writeText(detail.textContent);
};
