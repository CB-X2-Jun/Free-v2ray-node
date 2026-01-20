import fs from 'fs';
import net from 'net';

const raw = fs.readFileSync('node.txt', 'utf-8')
  .split(/\n+/)
  .map(l => l.trim())
  .filter(Boolean);

function parse(line) {
  const protocol = line.split('://')[0];
  const nameMatch = line.match(/#(.+)/);
  const rawName = nameMatch ? nameMatch[1] : '未知';

let name;
try {
  name = decodeURIComponent(rawName);
} catch {
  name = rawName;
}

const country = name.replace(/\d+.*/, '').trim();


  let host = null;
  let port = null;

  try {
    // vmess base64 直接跳过解析
    if (protocol === 'vmess') {
      return { protocol, name, country, host, port, raw: line, skip: true };
    }

    const u = new URL(line.replace(/#.*/, ''));
    host = u.hostname;
    port = Number(u.port);

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      port = null;
    }
  } catch {
    // ignore
  }

  return { protocol, name, country, host, port, raw: line };
}

function check(host, port, timeout = 3000) {
  return new Promise(resolve => {
    if (!host || !port) return resolve(false);

    const s = new net.Socket();
    s.setTimeout(timeout);

    s.once('connect', () => {
      s.destroy();
      resolve(true);
    });

    s.once('error', () => resolve(false));
    s.once('timeout', () => {
      s.destroy();
      resolve(false);
    });

    s.connect(port, host);
  });
}

(async () => {
  const result = [];

  for (const line of raw) {
    const n = parse(line);

    let alive = false;
    if (!n.skip) {
      alive = await check(n.host, n.port);
    }

    result.push({
      ...n,
      alive,
      checkedAt: Date.now()
    });
  }

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync(
    'data/nodes.json',
    JSON.stringify(result, null, 2)
  );
})();
