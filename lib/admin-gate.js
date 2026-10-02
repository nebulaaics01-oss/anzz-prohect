const crypto = require('crypto')
const { adminClient } = require('./supabase')

function secret() { return process.env.ADMIN_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '' }
function sign(value) { return crypto.createHmac('sha256', secret()).update(value).digest('hex') }
function parseCookie(req, name) {
  const raw = req.headers.cookie || ''
  const m = raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))
  return m ? decodeURIComponent(m.slice(name.length + 1)) : ''
}
function makeAdminCookie(token) {
  if (!secret() || !token) return ''
  const payload = Buffer.from(token, 'utf8').toString('base64url')
  return `${payload}.${sign(token)}`
}
async function verifyAdminCookie(req) {
  const value = parseCookie(req, 'anzz_admin')
  if (!value || !secret()) return false
  const dot = value.lastIndexOf('.')
  if (dot < 1) return false
  const payload = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  let token
  try { token = Buffer.from(payload, 'base64url').toString('utf8') } catch { return false }
  if (!token || !/^[a-f0-9]{64}$/.test(sig)) return false
  const expected = sign(token)
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  try {
    const sb = adminClient()
    const { data: authData, error: authError } = await sb.auth.getUser(token)
    if (authError || !authData.user) return false
    const { data: profile, error } = await sb.from('profiles').select('role').eq('id', authData.user.id).single()
    return !error && profile?.role === 'admin'
  } catch { return false }
}
module.exports = { makeAdminCookie, verifyAdminCookie }
