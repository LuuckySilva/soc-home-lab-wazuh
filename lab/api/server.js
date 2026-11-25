// SOC Home Lab — API de estudo. Falha A01 (IDOR) introduzida de propósito na Fase 2.1 e CORRIGIDA na Fase 2.8.
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;              // vem do .env, nunca do código
if (!JWT_SECRET) { console.error('JWT_SECRET não definido'); process.exit(1); }
const LOG_FILE = process.env.LOG_FILE || '/var/log/lab-api/api.log';
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

// Usuários FICTÍCIOS do lab (senhas fracas de propósito, só para teste)
const users = [
  { username: 'alice', passwordHash: bcrypt.hashSync('alice123', 10) },
  { username: 'bob',   passwordHash: bcrypt.hashSync('bob123', 10) },
];

// Pedidos fictícios: cada um tem um dono
const orders = [
  { id: 101, owner: 'alice', item: 'Notebook', total: 4500 },
  { id: 102, owner: 'alice', item: 'Mouse',    total: 120 },
  { id: 201, owner: 'bob',   item: 'Monitor',  total: 1300 },
];

// Log estruturado: uma linha JSON por evento (é isso que o Wazuh vai ler)
function log(event, data) {
  const entry = { timestamp: new Date().toISOString(), app: 'lab-api', event, ...data };
  const line = JSON.stringify(entry);
  fs.appendFileSync(LOG_FILE, line + '\n');
  console.log(line);
}

const app = express();
app.use(express.json());
const srcIp = (req) => (req.socket.remoteAddress || '').replace('::ffff:', '');

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    log('login_failure', { user: username || null, src_ip: srcIp(req), status: 401 });
    return res.status(401).json({ error: 'credenciais inválidas' });
  }
  const token = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '1h' });
  log('login_success', { user: user.username, src_ip: srcIp(req), status: 200 });
  res.json({ token });
});

// Middleware: só deixa passar quem tem JWT válido (AUTENTICAÇÃO)
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    log('auth_invalid_token', { src_ip: srcIp(req), path: req.path, status: 401 });
    res.status(401).json({ error: 'token inválido' });
  }
}

app.get('/orders/:id', auth, (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) {
    log('order_not_found', { user: req.user.sub, order_id: req.params.id, src_ip: srcIp(req), status: 404 });
    return res.status(404).json({ error: 'pedido não encontrado' });
  }

  // ✅ CORREÇÃO A01 (AUTORIZAÇÃO): o pedido precisa pertencer ao usuário logado.
  // Responde 404 (e não 403) para não revelar ao atacante que o pedido existe.
  // O log interno registra a verdade para o SOC.
  if (order.owner !== req.user.sub) {
    log('access_denied', { user: req.user.sub, order_id: order.id, resource_owner: order.owner, src_ip: srcIp(req), status: 404 });
    return res.status(404).json({ error: 'pedido não encontrado' });
  }

  // cross_user continua sendo registrado: se um bug futuro reabrir a falha, a regra 100120 avisa (detecção de regressão)
  log('order_access', { user: req.user.sub, order_id: order.id, resource_owner: order.owner, cross_user: order.owner !== req.user.sub, src_ip: srcIp(req), status: 200 });
  res.json(order);
});

app.listen(PORT, () => log('api_start', { port: PORT }));
