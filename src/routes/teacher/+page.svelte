<script lang="ts">
	import { Button } from '$lib/components';
	import { Tab } from '$lib/components';
	import { TabGroup } from '$lib/components';
	import { TabContent } from '$lib/components';

	import { Table } from '$lib/components';
	import { studentsArray } from './data-store.js';
	let blueStyle = "blueTable";
  </script>

<div>
	<TabGroup active="student">
		<span slot="tabs">
			<Tab key="student">Student List</Tab>
			<Tab key="analytic">Analytics</Tab>
		</span>
		<TabContent key="student">
			<Table tableData={$studentsArray} style={blueStyle}/>
		</TabContent>
		<TabContent key="analytic">contents on tab 2</TabContent>
	</TabGroup>
</div>

<style>
</style>
