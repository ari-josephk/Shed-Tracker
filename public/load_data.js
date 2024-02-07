async function loadData() {
	const response = await fetch('./public/data.json')
	const data = await response.json()

	return data
}

document.addEventListener('DOMContentLoaded', async () => {
	const data = await loadData()
	const dates = data['Date']

	getOptions = title => {
		return {
			tension: 0.2,
			scales: {
				x: {
					type: 'time',
					time: {
						unit: 'day',
						toolTipFormat: 'MM DD YYYY'
					},
					ticks: {
						source: 'data',
						display: false
					},
					grid: {
						drawTicks: false
					}
				},
			},
			plugins: {
				title: {
					display: true,
					text: title
				},
				decimation: {
					enabled: true,
					threshold: 10
				}
			}
		}
	}



	const sheds = dates.map((date, i) => { return { x: date, y: data['Total Count'][i] } })
	const age = dates.map((date, i) => { return { x: date, y: data['Average Age'][i] } })
	const feet = dates.map((date, i) => { return { x: date, y: data['Total Feet'][i] } })

	const manhattan = dates.map((date, i) => { return { x: date, y: data['Manhattan'][i] } })
	const brooklyn = dates.map((date, i) => { return { x: date, y: data['Brooklyn'][i] } })
	const queens = dates.map((date, i) => { return { x: date, y: data['Queens'][i] } })
	const bronx = dates.map((date, i) => { return { x: date, y: data['Bronx'][i] } })
	const statenIsland = dates.map((date, i) => { return { x: date, y: data['Staten Island'][i] } })


	const shedsReduction = 9000 - parseInt(data['Total Count'][data['Total Count'].length - 1])
	const shedsReductionPercent = shedsReduction / 9000
	const feetReduction = 2100000 - parseInt(data['Total Feet'][data['Total Feet'].length - 1])
	const feetReductionPercent = feetReduction / 2100000

	document.getElementById('shed-reduction').innerText = shedsReduction
	document.getElementById('shed-reduction-percent').innerHTML = (shedsReductionPercent * 100).toPrecision(2).toString() + '%'
	document.getElementById('feet-reduction').innerText = feetReduction
	document.getElementById('feet-reduction-percent').innerHTML = (feetReductionPercent * 100).toPrecision(2).toString() + '%'

	const ctxSheds = document.getElementById('shed-chart')
	const shedsChart = new Chart(ctxSheds, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Total',
				data: sheds
			}],

		},
		options: getOptions('Total Permitted Sheds')
	})

	const ctxAge = document.getElementById('age-chart')
	const ageChart = new Chart(ctxAge, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Average Age',
				data: age
			}],

		},
		options: getOptions('Average Permit Age (Days)')
	})

	const ctxFeet = document.getElementById('feet-chart')
	const feetChart = new Chart(ctxFeet, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Total Feet',
				data: feet
			}],

		},
		options: getOptions('Total Linear Feet of Sheds')
	})

	const ctxBoroughSheds = document.getElementById('borough-shed-chart')
	const boroughShedsChart = new Chart(ctxBoroughSheds, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Manhattan',
				data: manhattan
			},
			{
				label: 'Brooklyn',
				data: brooklyn
			},
			{
				label: 'Queens',
				data: queens
			},
			{
				label: 'Bronx',
				data: bronx
			},
			{
				label: 'Staten Island',
				data: statenIsland
			}],
		},
		options: getOptions('Total Sheds per Borough')
	})
})
