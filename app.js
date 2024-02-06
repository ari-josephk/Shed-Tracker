const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const csvParser = require('csv-parser')
const cron = require('node-cron')
const pythonShell = require('python-shell')
const childProcess = require('child_process')

const port = 3000

function compileData() {
	const pythonProcess = childProcess.spawn('py',[path.resolve('compile_data.py')])
	pythonProcess
			.on('close', code => console.log(`child process exited with code ${code}`))
			.on('error', err => console.log('Error running child'))
}
 
childProcess.exec(`pip install -r {}`, path.resolve('py-requirements.txt'))
compileData()
cron.schedule('0 9 * * *', compileData)

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