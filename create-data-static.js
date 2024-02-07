const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const csvParser = require('csv-parser')

data = {}

fs.createReadStream(path.resolve('./results.csv'))
		.pipe(csvParser())
		.on('headers', headers => headers.forEach(header => data[header] = new Array()))
		.on('data', row => Object.keys(row).forEach(element => data[element].push(row[element])))
		.on('end', () => fs.writeFileSync(path.resolve('./public/data.json'), JSON.stringify(data), 'utf8'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'))
})