const express = require('express');
const { getStats } = require('../../../lib/stats');

const router = express.Router();

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const stats = await getStats();
    res.json({
      success: true,
      total: stats.total,
      today: stats.today,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'gagal membaca statistik' });
  }
});

module.exports = router;
