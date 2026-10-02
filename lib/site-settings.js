const { adminClient } = require('./supabase')

const DEFAULTS = { maintenance: false, maintenance_message: 'Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.', broadcast_active: false, broadcast_id: null, broadcast_title: '', broadcast_message: '' }

async function getSiteSettings() {
  const { data, error } = await adminClient().from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return data || { id: 1, ...DEFAULTS }
}

async function isMaintenance() {
  const s = await getSiteSettings()
  return !!s.maintenance
}

async function requireAvailable(res) {
  const s = await getSiteSettings()
  if (s.maintenance) {
    res.status(503).json({ success: false, maintenance: true, message: s.maintenance_message || DEFAULTS.maintenance_message })
    return false
  }
  return true
}

module.exports = { getSiteSettings, isMaintenance, requireAvailable }
