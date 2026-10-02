const express = require('express')
const path = require('path')
const fs = require('fs')
const envFile = path.join(__dirname, '.env')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
const apiRoutes = require('./app/api/route')
const { verifyAdminCookie } = require('./lib/admin-gate')

const app = express()
const PORT = Number(process.env.PORT || 3300)

app.use(require('cors')())

// Admin dashboard is intentionally not linked from the user UI.
// Access is additionally protected by a signed, HttpOnly admin cookie.
app.get(['/admin','/admin/'], async (req, res) => {
  if (!(await verifyAdminCookie(req))) return res.redirect(302, '/?admin=1')
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})
app.get('/admin.html', (req, res) => res.status(404).send('Not Found'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate')
    }
  }
}))

app.use('/api', apiRoutes)

// Vercel memuat file ini sebagai Serverless/Fluid Function.
// Untuk lokal, tetap bisa dijalankan dengan `npm start`.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`server jalan di http://localhost:${PORT}`)
  })
}

module.exports = app
