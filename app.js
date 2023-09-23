const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'))
})

app.use(express.static(path.resolve('public')))

app.get('/csvData', (req, res) => {
	res.sendFile(path.resolve('results.csv'))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})