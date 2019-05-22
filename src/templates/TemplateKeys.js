module.exports = {
	SCRIPTS: {
		blankscript: require.resolve('./scripts/blankscript.js'),
	},
	OBJECTS: {
        	commerceextension: require.resolve('./objects/commerceextension.xml')
	},
	PROJECTCONFIGS: {
		cliconfig: require.resolve('./projectconfigs/cli-config.js'),
	},
};
