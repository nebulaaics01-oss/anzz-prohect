const express = require('express')
const auth = require('../../../lib/auth')
const { friendlyFirebaseError } = require('../../../lib/errors')
const { incrementStats } = require('../../../lib/stats')

const { requireAvailable } = require('../../../lib/site-settings')

const router = express.Router()

router.post('/', async (req, res) => {
  if (!(await requireAvailable(res))) return
  const { email } = req.body
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ success: false, message: 'email gak valid.' })
  }
  const em = email.trim().toLowerCase()
  const r = await auth.link(em)
  if (!r.ok) {
    return res.status(400).json({ success: false, message: friendlyFirebaseError(r.why), code: r.why })
  }
  // Catat setiap pengiriman link sebagai aktivitas. Statistik di dashboard akan langsung berubah.
  const stats = await incrementStats()
  return res.json({ success: true, email: em, message: `link dikirim ke ${em}. cek inbox / spam.`, stats })
})

module.exports = router