const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const csvParser = require('csv-parser')
const cron = require('node-cron')

const port = 3000

app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'))
})

app.use(express.static(path.resolve('public')))

app.get('/csvData', (req, res) => {
	res.sendFile(path.resolve('results.csv'))
})

app.get('/data', (req, res) => {
	data = {}

	fs.createReadStream('./results.csv')
			.pipe(csvParser())
			.on('headers', headers => headers.forEach(header => data[header] = new Array()))
			.on('data', row => Object.keys(row).forEach(element => data[element].push(row[element])))
			.on('end', () => res.send(data));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})