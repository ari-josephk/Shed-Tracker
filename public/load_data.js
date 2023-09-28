async function loadData() {
	const response = await fetch('./data')
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
						source: 'data'
					}
				},
			},
			plugins: {
				title: {
					display: true,
					text: title
				}
			}
		}
	}

	const sheds = dates.map((date, i) => { return { x: date, y: data['Total Count'][i] } })

	const manhattan = dates.map((date, i) => { return { x: date, y: data['Manhattan'][i] } })
	const brooklyn = dates.map((date, i) => { return { x: date, y: data['Brooklyn'][i] } })
	const queens = dates.map((date, i) => { return { x: date, y: data['Queens'][i] } })
	const bronx = dates.map((date, i) => { return { x: date, y: data['Bronx'][i] } })
	const statenIsland = dates.map((date, i) => { return { x: date, y: data['Staten Island'][i] } })


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

	const ctxBoroughSheds = document.getElementById('borough-shed-chart')
	const boroughShedsChart = new Chart(ctxBoroughSheds, {
		type: 'line',
		data: {
			datasets: [{
				label: 'Manhattan',
				data: manhattan
			},
			{
				label: 'Brooklym',
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
