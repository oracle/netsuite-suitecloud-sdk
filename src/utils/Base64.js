'use strict';

module.exports = class Base64 {
	static encode(string) {
		const buff = Buffer.from(string);
		return buff.toString('base64');
	}

	static decode(string) {
		const buff = Buffer.from(string, 'base64');
		return buff.toString('utf8');
	}
};
