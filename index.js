import router from './src/router.js';
import RouterView from './src/RouterView.svelte';
import links from './src/links.js';
import link from './src/link.js';

window.addEventListener('popstate', (event) => {
	router._updateCurrentRoute(event.state);
});

export {
	router,
	RouterView,
	links,
	link,
};