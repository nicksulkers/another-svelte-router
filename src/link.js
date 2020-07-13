import router from './router';

export default function link(node) {
	function onClick(e) {
		let options = {};
		if(this.type)
			options.type = this.type;
		if(options.type === 'external')
			return;
		e.preventDefault();
		router.navigate(this.href, options);
	}

	node.addEventListener('click', onClick);
	return {
		destroy() {
			node.removeEventListener('click', onClick);
		}
	};
}