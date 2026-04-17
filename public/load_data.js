async function loadData() {
	const response = await fetch('./public/data.json')
	const data = await response.json()
	return data
}

const COLORS = {
	primary: '#2e7d32',
	primaryLight: '#66bb6a',
	secondary: '#1565c0',
	accent: '#f57c00',
	red: '#e53935',
	purple: '#7b1fa2',
	teal: '#00897b',
	borough: ['#1565c0', '#e53935', '#f57c00', '#7b1fa2', '#00897b']
}

function getBaseChartOptions(height) {
	return {
		chart: {
			height: height || 350,
			toolbar: { show: true, tools: { download: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
			zoom: { enabled: true, type: 'x' },
			fontFamily: "'Inter', sans-serif",
			foreColor: '#8c959f'
		},
		stroke: { curve: 'smooth', width: 2 },
		dataLabels: { enabled: false },
		grid: { borderColor: '#eee', strokeDashArray: 4 },
		tooltip: { x: { format: 'MMM dd, yyyy' }, theme: 'light' },
		xaxis: { type: 'datetime', labels: { datetimeUTC: false } }
	}
}

function toTimestamp(dateStr) {
	return new Date(dateStr).getTime()
}

document.addEventListener('DOMContentLoaded', async () => {
	const data = await loadData()
	const dates = data['Date']
	const len = dates.length

	// === DATA TRANSFORMS (existing 4 charts) ===
	const sheds = dates.map((d, i) => [toTimestamp(d), data['Total Count'][i]])
	const age = dates.map((d, i) => [toTimestamp(d), data['Average Age'][i]])
	const feet = dates.map((d, i) => [toTimestamp(d), data['Total Feet'][i]])

	const boroughNames = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
	const boroughSeries = boroughNames.map((name, bi) => ({
		name,
		data: dates.map((d, i) => [toTimestamp(d), data[name][i]])
	}))

	// === METRIC CALCULATIONS (unchanged logic) ===
	const shedsReduction = 9000 - parseInt(data['Total Count'][len - 1])
	const shedsReductionPercent = shedsReduction / 9000
	const feetReduction = 2100000 - parseInt(data['Total Feet'][len - 1])
	const feetReductionPercent = feetReduction / 2100000

	// Stat cards
	document.getElementById('shed-reduction').innerText = shedsReduction.toLocaleString()
	document.getElementById('shed-reduction-percent').innerHTML = (shedsReductionPercent * 100).toPrecision(2).toString() + '%'
	document.getElementById('feet-reduction').innerText = feetReduction.toLocaleString()
	document.getElementById('feet-reduction-percent').innerHTML = (feetReductionPercent * 100).toPrecision(2).toString() + '%'

	// Bullet point text (same IDs as before, now duplicated in the summary card)
	document.getElementById('shed-reduction-text').innerText = shedsReduction.toLocaleString()
	document.getElementById('shed-reduction-percent-text').innerHTML = (shedsReductionPercent * 100).toPrecision(2).toString() + '%'
	document.getElementById('feet-reduction-text').innerText = feetReduction.toLocaleString()
	document.getElementById('feet-reduction-percent-text').innerHTML = (feetReductionPercent * 100).toPrecision(2).toString() + '%'

	// === EXISTING CHART 1: Total Permitted Sheds (area) ===
	new ApexCharts(document.getElementById('shed-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'area' },
		series: [{ name: 'Total Sheds', data: sheds }],
		colors: [COLORS.primary],
		fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] } },
		yaxis: { title: { text: 'Shed Count' }, labels: { formatter: v => Math.round(v).toLocaleString() } }
	}).render()

	// === EXISTING CHART 2: Borough Sheds Over Time (line) ===
	new ApexCharts(document.getElementById('borough-shed-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'line' },
		series: boroughSeries,
		colors: COLORS.borough,
		yaxis: { title: { text: 'Shed Count' }, labels: { formatter: v => Math.round(v).toLocaleString() } },
		legend: { position: 'top', horizontalAlign: 'center' }
	}).render()

	// === EXISTING CHART 3: Total Linear Feet (area) ===
	new ApexCharts(document.getElementById('feet-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'area' },
		series: [{ name: 'Total Feet', data: feet }],
		colors: [COLORS.secondary],
		fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] } },
		yaxis: { title: { text: 'Linear Feet' }, labels: { formatter: v => Math.round(v).toLocaleString() } }
	}).render()

	// === EXISTING CHART 4: Average Permit Age (area) ===
	new ApexCharts(document.getElementById('age-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'area' },
		series: [{ name: 'Average Age', data: age }],
		colors: [COLORS.accent],
		fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] } },
		yaxis: { title: { text: 'Days' }, labels: { formatter: v => Math.round(v).toLocaleString() } }
	}).render()

	// === NEW CHART 5: Borough Distribution Donut (latest snapshot) ===
	const boroughLatest = boroughNames.map(name => parseInt(data[name][len - 1]))
	new ApexCharts(document.getElementById('borough-donut-chart'), {
		chart: { type: 'donut', height: 320, fontFamily: "'Inter', sans-serif", foreColor: '#8c959f' },
		series: boroughLatest,
		labels: boroughNames,
		colors: COLORS.borough,
		plotOptions: { pie: { donut: { size: '55%', labels: { show: true, total: { show: true, label: 'Total Sheds', formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString() } } } } },
		legend: { position: 'bottom' },
		dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' }
	}).render()

	// === NEW CHART 6: Cumulative Sheds Removed / Progress (area) ===
	const progressData = dates.map((d, i) => [toTimestamp(d), 9000 - data['Total Count'][i]])
	new ApexCharts(document.getElementById('progress-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'area' },
		series: [{ name: 'Sheds Removed', data: progressData }],
		colors: [COLORS.primary],
		fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 100] } },
		yaxis: { title: { text: 'Cumulative Sheds Removed' }, labels: { formatter: v => Math.round(v).toLocaleString() } },
		annotations: {
			yaxis: [{ y: shedsReduction, borderColor: COLORS.primary, strokeDashArray: 4, label: { text: 'Current: ' + shedsReduction.toLocaleString(), style: { color: '#fff', background: COLORS.primary } } }]
		}
	}).render()

	// === NEW CHART 7: Daily Net Shed Change (bar) ===
	const dailyChange = []
	for (let i = 1; i < len; i++) {
		dailyChange.push([toTimestamp(dates[i]), data['Total Count'][i] - data['Total Count'][i - 1]])
	}
	new ApexCharts(document.getElementById('daily-change-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'bar' },
		series: [{ name: 'Daily Change', data: dailyChange }],
		colors: [({ value }) => value < 0 ? COLORS.primary : COLORS.red],
		plotOptions: { bar: { columnWidth: '90%' } },
		yaxis: { title: { text: 'Net Change' }, labels: { formatter: v => Math.round(v).toString() } }
	}).render()

	// === NEW CHART 8: Monthly Aggregated Change (bar) ===
	const monthlyMap = {}
	for (let i = 1; i < len; i++) {
		const monthKey = dates[i].substring(0, 7) // "YYYY-MM"
		if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0
		monthlyMap[monthKey] += data['Total Count'][i] - data['Total Count'][i - 1]
	}
	const monthlyData = Object.entries(monthlyMap).map(([month, val]) => ({
		x: month + '-15', // mid-month for display
		y: val
	}))
	new ApexCharts(document.getElementById('monthly-change-chart'), {
		...getBaseChartOptions(320),
		chart: { ...getBaseChartOptions(320).chart, type: 'bar' },
		series: [{ name: 'Monthly Net Change', data: monthlyData }],
		colors: [({ value }) => value < 0 ? COLORS.primary : COLORS.red],
		plotOptions: { bar: { columnWidth: '70%', borderRadius: 3 } },
		xaxis: { type: 'datetime', labels: { format: 'MMM yyyy', datetimeUTC: false } },
		yaxis: { title: { text: 'Net Change' }, labels: { formatter: v => Math.round(v).toLocaleString() } },
		tooltip: { x: { format: 'MMM yyyy' } }
	}).render()

	// === NEW CHART 9: Year-over-Year Comparison (multi-line) ===
	const yearGroups = {}
	dates.forEach((d, i) => {
		const dt = new Date(d)
		const year = dt.getFullYear()
		if (!yearGroups[year]) yearGroups[year] = []
		// Day-of-year as x-axis: use a fake common year (2000) so lines overlay
		const fakeDate = new Date(2000, dt.getMonth(), dt.getDate()).getTime()
		yearGroups[year].push([fakeDate, data['Total Count'][i]])
	})
	const yoyColors = ['#9e9e9e', COLORS.secondary, COLORS.accent, COLORS.primary]
	const yoySeries = Object.keys(yearGroups).sort().map((year, i) => ({
		name: year,
		data: yearGroups[year]
	}))
	new ApexCharts(document.getElementById('yoy-chart'), {
		...getBaseChartOptions(380),
		chart: { ...getBaseChartOptions(380).chart, type: 'line' },
		series: yoySeries,
		colors: yoyColors.slice(0, yoySeries.length),
		xaxis: { type: 'datetime', labels: { format: 'MMM dd', datetimeUTC: false } },
		yaxis: { title: { text: 'Total Sheds' }, labels: { formatter: v => Math.round(v).toLocaleString() } },
		legend: { position: 'top', horizontalAlign: 'center' },
		tooltip: { x: { format: 'MMM dd' } }
	}).render()
})
