<script lang="ts">
	import { Button } from '$lib/components';
	import { Tab } from '$lib/components';
	import { TabGroup } from '$lib/components';
	import { TabContent } from '$lib/components';
</script>

<div>
	<TabGroup active="student">
		<span slot="tabs">
			<Tab key="student">One</Tab>
			<Tab key="analytic">Two</Tab>
		</span>
		<TabContent key="student">contents on tab 1</TabContent>
		<TabContent key="analytic">contents on tab 2</TabContent>
	</TabGroup>
</div>

<style>
</style>
