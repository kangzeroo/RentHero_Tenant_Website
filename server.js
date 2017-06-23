const express = require('express')
const path = require('path')

const app = express()

// viewed at http://localhost:8080
app.get('/bundle.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, './dist/bundle.js'))
})
app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './dist/index.html'))
})

app.listen(8080)
