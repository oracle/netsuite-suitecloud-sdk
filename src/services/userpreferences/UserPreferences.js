module.exports = class UserPreferences {
	constructor(options) {
		this._useProxy = options.useProxy;
		this._proxyUrl = options.proxyUrl;
	}

	get proxyUrl() {
		return this._proxyUrl;
	}

	get useProxy() {
		return this._useProxy;
	}

	toJSON() {
		return {
			proxyUrl: this._proxyUrl,
			useProxy: this._useProxy,
		};
	}

	static fromJson(json) {
		return new UserPreferences({
			useProxy: json.useProxy,
			proxyUrl: json.proxyUrl,
		});
	}
};
