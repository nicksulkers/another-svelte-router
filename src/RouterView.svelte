<script>
	import router from './router.js';

	export let url;
	if (!url)
		url = location.href;

	let component;
	router.on('afterRouteChange', route => {
		if (component === route.component) {
			component = null;
			requestAnimationFrame(() => component = route.component);
		} else component = route.component;
	});
	router._updateCurrentRoute({
		url, meta: {}
	});
</script>

{#if component}
	<svelte:component this={component}/>
{/if}