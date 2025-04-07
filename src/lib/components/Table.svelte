<script>
	export let tableData = [
		{
			vitae: 'dolorem',
			lectus: 'ipsum',
			quisquam: 'quia'
		},
		{
			vitae: 'amet',
			lectus: 'consectetur',
			quisquam: 'adipisci'
		}
	];
	export let style;
</script>

<table class={style}>
	<thead>
		<tr>
			{#each Object.keys(tableData[0]) as columnHeading}
				<th>{columnHeading}</th>
			{/each}
		</tr><tr />
	</thead>
	<tbody>
		{#each Object.values(tableData) as row}
			<tr>
				{#each Object.values(row) as cell}
					<td>{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table,
	th,
	td {
		border: 1px solid;
		border-collapse: collapse;
		margin-bottom: 10px;
	}

	table.blueTable {
		border: 1px solid #1c6ea4;
		background-color: #eeeeee;
		width: 100%;
		text-align: left;
		border-collapse: collapse;
	}
	table.blueTable td,
	table.blueTable th {
		border: 1px solid #aaaaaa;
		padding: 3px 2px;
	}
	table.blueTable tbody td {
		font-size: 13px;
	}
	table.blueTable tr:nth-child(even) {
		background: #d0e4f5;
	}
	table.blueTable thead {
		background: #1c6ea4;
		background: -moz-linear-gradient(top, #5592bb 0%, #327cad 66%, #1c6ea4 100%);
		background: -webkit-linear-gradient(top, #5592bb 0%, #327cad 66%, #1c6ea4 100%);
		background: linear-gradient(to bottom, #5592bb 0%, #327cad 66%, #1c6ea4 100%);
		border-bottom: 2px solid #444444;
	}
	table.blueTable thead th {
		font-size: 15px;
		font-weight: bold;
		color: #ffffff;
		border-left: 2px solid #d0e4f5;
	}
	table.blueTable thead th:first-child {
		border-left: none;
	}
</style>
