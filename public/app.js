let nodes = [];


fetch('/data/nodes.json').then(r => r.json()).then(d => {
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
</tr>`).join('');
}


protocol.onchange = country.onchange = render;


window.show = raw => {
modal.classList.remove('hidden');
detail.textContent = decodeURIComponent(raw);
}


close.onclick = () => modal.classList.add('hidden');
copy.onclick = () => navigator.clipboard.writeText(detail.textContent);
