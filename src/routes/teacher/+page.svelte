<script  lang="ts">
	import { Button } from '$lib/components';
	import { Tab } from '$lib/components';
	import { TabGroup } from '$lib/components';
	import { TabContent } from '$lib/components';

	import { Table } from '$lib/components';
	import { studentsArray } from './data-store.js';
	let blueStyle = "blueTable";
  </script>

<div class="teacher">

	<div class="logo">Math Maze</div>

	<TabGroup active="student">
		<span slot="tabs">
			<Tab key="student">Student List</Tab>
			<Tab key="analytic">Analytics</Tab>
			<Tab key="bookmarks">Bookmarks</Tab>
		</span>
		<TabContent key="student">
			Mock table data right now. Will have a list of the students on the teachers roster with links to their individual problem sets and the students view of the game.
			<Table tableData={ $studentsArray } style={ blueStyle }/>
		</TabContent>
		<TabContent key="analytic">This will show the class analyitc so that the teacher will be able to view how their students are doing with the problem sets.</TabContent>
		<TabContent key="bookmarks">Bookmarked tabs by the teacher for ease of access.</TabContent>
	</TabGroup>
</div>

<style>
	.teacher {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: left;
		position: relative;
		width: 100%;
		height: 100%;
		padding: 3rem;
	}

	.logo {
		color: black;
		font-family: 'NovaFlat-Book', sans-serif;
		font-size: 50px;
		line-height: 1.2;
		font-weight: 700;
		margin-bottom: var(--teacher-spacing);
		text-align: center;
		animation: fadeIn 1.5s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
