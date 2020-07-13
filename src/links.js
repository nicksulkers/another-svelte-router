import router from './router';

export default function links(node) {
	function onClick(e) {
		let options = {};
		if(this.type)
			options.type = this.type;
		if(options.type === 'external')
			return;
		e.preventDefault();
		router.navigate(this.href, options);
	}

	let a = node.getElementsByTagName('a');
	for(let i = 0; i < a.length; ++i)
		a[i].addEventListener('click', onClick);

	return {
		destroy() {
			let a = node.getElementsByTagName('a');
			for(let i = 0; i < a.length; ++i)
				a[i].addEventListener('click', onClick);
		}
	};
}