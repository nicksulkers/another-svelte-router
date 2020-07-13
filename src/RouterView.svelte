<script>
	import router from './router.js';

	let path;

	if(!path)
		path = location.pathname;

	let component;
	router.on('afterRouteChange', route => {
		component = route.component;
	});
	router._updateCurrentRoute(path);
</script>

{#if component}
	<svelte:component this={component}/>
{/if}