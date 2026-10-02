const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const dataDir = path.join(__dirname, '..', 'data');
const statsFile = path.join(dataDir, 'stats.json');

// Supabase is preferred for Vercel/serverless because its database is persistent.
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Kept as an optional fallback for installations that already configured Upstash.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REDIS = Boolean(REDIS_URL && REDIS_TOKEN);

function getTodayDateString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

const defaultStats = { totalPremium: 0, todayPremium: 0, lastDate: getTodayDateString() };

async function supabaseRequest(pathname, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${pathname}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const bodyText = await response.text();
  let body = null;
  try { body = bodyText ? JSON.parse(bodyText) : null; } catch (_) { body = bodyText; }
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body;
}

async function getSupabaseStats() {
  const rows = await supabaseRequest('/rest/v1/activation_stats?id=eq.1&select=total_activations,today_activations,stat_date&limit=1');
  const row = rows?.[0];
  if (!row) return { total: 0, today: 0 };
  const today = getTodayDateString();
  if (String(row.stat_date).slice(0, 10) !== today) {
    // Reset today's counter lazily at the start of a new WIB day.
    const reset = await supabaseRequest('/rest/v1/activation_stats?id=eq.1', {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ today_activations: 0, stat_date: today, updated_at: new Date().toISOString() })
    });
    const r = reset?.[0] || row;
    return { total: Number(r.total_activations || 0), today: Number(r.today_activations || 0) };
  }
  return { total: Number(row.total_activations || 0), today: Number(row.today_activations || 0) };
}

async function incrementSupabaseStats() {
  // The SQL function performs an atomic increment and handles the WIB day reset.
  const rows = await supabaseRequest('/rest/v1/rpc/increment_activation_stats', {
    method: 'POST',
    body: '{}'
  });
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { total: Number(row?.total || 0), today: Number(row?.today || 0) };
}

async function redisPipeline(commands) {
  const r = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error(`Redis HTTP ${r.status}`);
  return r.json();
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch (_) {}
  }
}

function loadLocalStats() {
  ensureDataDir();
  try {
    if (fs.existsSync(statsFile)) {
      const data = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
      const today = getTodayDateString();
      if (data.lastDate !== today) {
        data.todayPremium = 0;
        data.lastDate = today;
        saveLocalStats(data);
      }
      return data;
    }
  } catch (err) { console.error('Error reading stats.json:', err); }
  saveLocalStats(defaultStats);
  return { ...defaultStats };
}

function saveLocalStats(statsObj) {
  ensureDataDir();
  try { fs.writeFileSync(statsFile, JSON.stringify(statsObj, null, 2), 'utf8'); }
  catch (err) { console.error('Error writing stats.json:', err.message); }
}

async function getStats() {
  if (USE_SUPABASE) {
    try { return await getSupabaseStats(); }
    catch (err) { console.error('Supabase stats read failed:', err.message); }
  }
  if (USE_REDIS) {
    try {
      const today = getTodayDateString();
      const result = await redisPipeline([
        ['GET', 'am:stats:total'],
        ['GET', `am:stats:today:${today}`]
      ]);
      return { total: Number(result?.[0]?.result || 0), today: Number(result?.[1]?.result || 0) };
    } catch (err) { console.error('Redis stats read failed:', err.message); }
  }
  const current = loadLocalStats();
  return { total: Number(current.totalPremium || 0), today: Number(current.todayPremium || 0) };
}

async function incrementStats() {
  if (USE_SUPABASE) {
    try { return await incrementSupabaseStats(); }
    catch (err) { console.error('Supabase stats increment failed:', err.message); }
  }
  if (USE_REDIS) {
    try {
      const today = getTodayDateString();
      const result = await redisPipeline([
        ['INCR', 'am:stats:total'],
        ['INCR', `am:stats:today:${today}`]
      ]);
      return { total: Number(result?.[0]?.result || 0), today: Number(result?.[1]?.result || 0) };
    } catch (err) { console.error('Redis stats increment failed:', err.message); }
  }
  const current = loadLocalStats();
  current.totalPremium = Number(current.totalPremium || 0) + 1;
  current.todayPremium = Number(current.todayPremium || 0) + 1;
  current.lastDate = getTodayDateString();
  saveLocalStats(current);
  return { total: current.totalPremium, today: current.todayPremium };
}

module.exports = { getStats, incrementStats };
