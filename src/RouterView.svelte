<script>
	import router from './router.js';

	let path;

	if(!path)
		path = location.pathname;

	let component;
	router.on('afterRouteChange', route => {
		if (component === route.component) {
			component = null;
			requestAnimationFrame(() => component = route.component);
		} else component = route.component;
	});
	router._updateCurrentRoute(path);
</script>

{#if component}
	<svelte:component this={component}/>
{/if}