function regexEscapeString(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pathToRegex(path) {
	return new RegExp('^' + (
		path
			.split(/:[a-z0-9\-_]+/i)
			.map(f => regexEscapeString(f))
			.join('([^\/]+)')
	) + '$');
}

function extractParams(path) {
	let matches = path.match(/:[a-z0-9\-_]+/gi);
	return matches
		? matches.map(f => f.substr(1))
		: [];
}

export default {
	_currentRoute: null,
	params: {},
	query: {},
	_routes: [],
	_eventHandlers: {},
	add: function (path, ...args) {
		if (Array.isArray(path))
			return this.addMany(path);
		else
			return this.addOne(path, ...args);
	},
	addMany: function (routes) {
		for (let route of routes)
			this.addOne(...route);
		return this;
	},
	addOne: function (path, ...args) {
		let _this = this;
		let component, middleware;
		if (args.length === 0) {
			component = path;
			path = '*';
			middleware = [];
		} else {
			component = args.pop();
			middleware = args;
		}

		_this._routes.push({
			path,
			middleware,
			component
		});

		return _this;
	},
	group: function (path, ...args) {
		let root = this,
			rootPath = path || '',
			rootArgs = args;
		return {
			add: function (path, ...args) {
				root.add(rootPath + path, ...([].concat(rootArgs, args)));
				return this;
			},
			addMany: function (routes) {
				for (let route of routes) {
					let args = [route.shift()].concat(rootArgs, route);
					if (args[0] !== '*')
						args[0] = rootPath + args[0];
					root.addOne(...args);
				}
				return this;
			},
			addOne: function (path, ...args) {
				root.addOne(rootPath + path, ...([].concat(rootArgs, args)));
				return this;
			},
			group: function (path, args) {
				return root.group(rootPath + path, ...([].concat(rootArgs, args)));
			}
		}
	},
	navigate: function (destination, options) {
		options = Object.assign({
			type: 'push' // internal, external, replace, push
		}, options || {});

		if (options.params)
			for (let param in options.params)
				destination = destination.replace(':' + param, options.params[param]);

		let url;
		if (destination.match(/^(https?:)?\/\//i))
			url = new URL(destination);
		else
			url = new URL(destination, location.href);

		if (url.protocol !== location.protocol || url.hostname !== location.hostname || options.type === 'external')
			location.href = url.href;
		else {
			let state = {
				url: url.href,
				meta: options.meta || {}
			};
			if (options.type !== 'internal')
				history[options.type === 'replace' ? 'replaceState' : 'pushState'](state, '', url.href);
			this._updateCurrentRoute(state);
		}
		return this;
	},
	_updateCurrentRoute: function (state) {
		let url = state?.url || location.href;
		if (url.match(/^(https?:)?\/\//i))
			url = new URL(url);
		else
			url = new URL(url, location.href);

		let _this = this;
		let paramsMap = new WeakMap();

		_this._trigger('beforeRouteChange', [url.href]);

		let potentialRoutes = [];
		for (let route of _this._routes) {
			if (route.path === '*') {
				potentialRoutes.push(route);
				continue;
			}

			let match = url.pathname.match(pathToRegex(route.path));
			if (match) {
				potentialRoutes.push(route)
				paramsMap.set(route, match);
			}
		}

		if (!potentialRoutes.length)
			throw new Error(`No route matches location '${url.pathname}'`);

		(function nextRoute() {
			let route = potentialRoutes.shift();
			if (!route)
				throw new Error(`No route is valid for location '${url.pathname}'`);

			_this.params = {};
			let matchedParamValues = paramsMap.get(route);
			if (matchedParamValues) {
				let paramNames = extractParams(route.path);
				matchedParamValues.shift();
				while (matchedParamValues.length) {
					_this.params[paramNames.shift()] = matchedParamValues.shift();
				}
			}

			function pickRoute() {
				_this._currentRoute = route;
				_this.meta = state?.meta || {};
				_this.query = {};
				let searchParams = new URLSearchParams(location.search);
				for (let pair of searchParams.entries()) {
					_this.query[pair[0]] = pair[1];
				}
				_this._trigger('afterRouteChange', [_this._currentRoute]);
			}

			if (route.middleware.length === 0)
				return pickRoute();

			let middlewares = [].concat(route.middleware);

			(async function nextMiddleware() {
				let middleware = middlewares.shift();
				if (!middleware)
					return pickRoute();

				if (typeof middleware === 'function') {
					let result;
					try {
						result = await Promise.resolve(middleware(_this));
					} catch (e) {
						return nextRoute();
					}
					if (result === true) return nextMiddleware();
					if (result === false) return nextRoute();
				} else nextMiddleware();
			})();
			return _this;
		})();
	},
	on: function (name, handler) {
		if (this._eventHandlers.hasOwnProperty(name))
			this._eventHandlers[name].push(handler);
		else
			this._eventHandlers[name] = [handler];
		return this;
	},
	off: function (name, handler) {
		if (!this._eventHandlers.hasOwnProperty(name))
			return;

		let index = this.events[name].indexOf(handler);
		if (index !== -1)
			this._eventHandlers[name].splice(index, 1);
		return this;
	},
	_trigger: function (name, args) {
		if (!this._eventHandlers.hasOwnProperty(name))
			return;

		if (!args || !args.length)
			args = [];

		for (let eventHandler of this._eventHandlers[name])
			eventHandler(...args);
		return this;
	}
};