import fs from 'fs';
import net from 'net';


const raw = fs.readFileSync('node.txt', 'utf-8').split(/\n+/).filter(Boolean);


function parse(line) {
const protocol = line.split('://')[0];
const nameMatch = line.match(/#(.+)/);
const name = nameMatch ? nameMatch[1] : '未知';
const country = name.replace(/\d+.*/, '');


let host = '', port = '';
try {
const u = new URL(line.replace(/#.*/, ''));
host = u.hostname;
port = u.port;
} catch {}


return { protocol, name, country, host, port, raw: line };
}


function check(host, port, timeout = 3000) {
return new Promise(res => {
const s = new net.Socket();
s.setTimeout(timeout);
s.once('connect', () => { s.destroy(); res(true); });
s.once('error', () => res(false));
s.once('timeout', () => { s.destroy(); res(false); });
s.connect(port, host);
});
}


(async () => {
const result = [];
for (const line of raw) {
const n = parse(line);
const alive = await check(n.host, n.port);
result.push({ ...n, alive, checkedAt: Date.now() });
}
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/nodes.json', JSON.stringify(result, null, 2));
})();
