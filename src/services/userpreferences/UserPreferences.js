module.exports = class UserPreferences {
	constructor(options) {
		this._useProxy = options.useProxy;
		this._proxyUrl = options.proxyUrl;
	}

	get proxyInfo() {
		this._proxyUrl;
	}

	toJSON() {
		return {
			proxyUrl: this._proxyUrl,
		};
	}

	static fromJson(json) {
		return new UserPreferences({
			useProxy: json.useProxy,
			proxyUrl: json.proxyUrl,
		});
	}
};
