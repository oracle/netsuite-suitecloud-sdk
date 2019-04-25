'use strict';

class Translation {

	start(service, keys){
		this.service = service;
		this.keys = keys;
	}
	
	getMessage (key, params = []) {
		return this.keys && this.service.getMessage(
			this.keys[key], ...params
		) || '';
	}

};

module.exports = new Translation();