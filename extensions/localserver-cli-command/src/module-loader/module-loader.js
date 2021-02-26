/*
** Copyright (c) 2021 Oracle and/or its affiliates.  All rights reserved.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

var requirejs, require, define;
(function() {
    function ModuleLoader() {
        var self = this;

        this.moduleDefine = {};
        this.moduleReturn = {};
        this.modulePending = {};
        this.configuration = {};
        this.moduleShim = {};
        this.moduleDoubleCheck = {};

        this.starter = [];

        this.require = function(dependencies, callback) {
            if (typeof dependencies === 'string') {
                return self.execute(dependencies, []);
            } else {
                self.addStarter({
                    dependencies: dependencies,
                    callback: callback || function() {}
                });
                self.loadScripts(dependencies);
            }
        };

        this.require.version = '1.0.0';

        this.require.config = function(config) {
            if (config.baseUrl && config.baseUrl.charAt(config.baseUrl.length - 1) !== '/') {
                config.baseUrl += '/';
            }

            self.configuration = self.deepExtend(self.configuration, config);
        };

        this.requirejs = this.require;

        this.define = function(name, dependencies, callback) {
            if (typeof name !== 'string') {
                callback = dependencies;
                dependencies = name;
                name = null;
            }

            if (!Array.isArray(dependencies)) {
                callback = dependencies;
                dependencies = [];
            }

            if (!name) {
                var currentScript = self.getCurrentScript();
                if (currentScript) {
                    name = currentScript.getAttribute('data-requiremodule');
                }
            }

            var shimName = '';
            if (
                self.configuration.shim &&
                self.configuration.shim[name] &&
                self.configuration.shim[name].deps
            ) {
                dependencies = self.configuration.shim[name].deps;
                shimName = name;
            }

            if (name) {
                if (shimName && self.moduleDefine[name]) {
                    self.moduleShim[shimName] = {
                        name: name,
                        dependencies: dependencies,
                        callback: callback
                    };
                } else if (!self.moduleDefine[name]) {
                    self.moduleDefine[name] = {
                        name: name,
                        dependencies: dependencies,
                        callback: callback
                    };
                }
            }
        };

        this.define.amd = {};

        this.currentlyAddingScript = null;
        this.interactiveScript = null;

        this.addStarter = function(context) {
            self.starter.push(context);
        };

        this.getCurrentScript = function() {
            if (self.currentlyAddingScript) {
                return self.currentlyAddingScript;
            }

            if (self.interactiveScript && self.interactiveScript.readyState === 'interactive') {
                return self.interactiveScript;
            }

            if (document.currentScript) {
                self.interactiveScript = document.currentScript;
                return self.interactiveScript;
            }

            self.eachReverse(self.getScripts(), function(script) {
                if (script.readyState === 'interactive') {
                    self.interactiveScript = script;
                    return self.interactiveScript;
                }
            });

            return self.interactiveScript;
        };

        this.getScripts = function() {
            return document.getElementsByTagName('script');
        };

        this.eachReverse = function(arr, callback) {
            if (!Array.isArray(arr)) return;
            for (var i = arr.length - 1; i >= 0; i--) {
                if (callback(arr[i], i, arr)) break;
            }
        };

        this.overrideMapDependency = function(dependency, amdModuleName) {
            if (
                amdModuleName &&
                self.configuration.map &&
                self.configuration.map[amdModuleName] &&
                self.configuration.map[amdModuleName][dependency]
            ) {
                return self.configuration.map[amdModuleName][dependency];
            } else if (
                self.configuration.map &&
                self.configuration.map['*'] &&
                self.configuration.map['*'][dependency]
            ) {
                return self.configuration.map['*'][dependency];
            } else {
                return dependency;
            }
        };

        this.loadScripts = function(dependencies, module) {
            for (var i = 0; i < dependencies.length; i++) {
                var dependency = self.overrideMapDependency(dependencies[i], module);

                if (dependency.indexOf('!') !== -1) {
                    var pluginTest = dependency.split('!');

                    self.loadScripts(pluginTest, module);
                } else if (
                    dependency !== 'require' &&
                    dependency !== 'exports' &&
                    !self.modulePending[dependency] &&
                    !self.moduleDefine[dependency]
                ) {
                    self.modulePending[dependency] = true;
                    self.loadScript(dependency);
                } else if (!self.moduleDoubleCheck[dependency]) {
                    self.moduleDoubleCheck[dependency] = true;

                    if (self.moduleDefine[dependency]) {
                        self.modulePending[dependency] = true;
                        self.loadScripts(self.moduleDefine[dependency].dependencies);
                        delete self.modulePending[dependency];
                    }
                }
            }

            if (Object.keys(self.modulePending).length === 0) {
                var ctx;
                var starter = self.copyArray(self.starter);
                self.starter = [];
                while ((ctx = starter.shift())) {
                    self.makeRequire(ctx);
                }
            }
        };

        this.loadScript = function(name) {
            var url = self.configuration.baseUrl || '';
            if (self.configuration.paths && self.configuration.paths[name]) {
                url += self.configuration.paths[name];
            } else {
                url += name;
            }

            if (!/\.js$/.test(url)) {
                url += '.js';
            }

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.async = true;
            script.src = url;

            function onScriptLoad() {
                if (self.moduleDefine[name]) {
                    self.loadScripts(self.moduleDefine[name].dependencies, name);
                }

                document.head.removeChild(script);
                script = null;
                delete self.modulePending[name];
                if (Object.keys(self.modulePending).length === 0) {
                    var ctx;
                    var starter = self.copyArray(self.starter);
                    self.starter = [];
                    while ((ctx = starter.shift())) {
                        self.makeRequire(ctx);
                    }
                }
            }


            function onScriptError(error) {
                script = null;
                delete self.modulePending[name];

                console.error('Module "' + name + '" on "' + url + '" not found');
            }

            script.setAttribute('data-requiremodule', name);
            script.addEventListener('load', onScriptLoad, false);
            script.addEventListener('error', onScriptError, false);

            self.currentlyAddingScript = script;

            document.head.appendChild(script);
            self.currentlyAddingScript = null;
        };

        this.makeRequire = function(context) {
            var depExports = [];

            for (var i = 0; i < context.dependencies.length; i++) {
                depExports.push(
                    self.execute(self.overrideMapDependency(context.dependencies[i]), [])
                );
            }

            context.callback.apply(undefined, depExports);
        };

        this.execute = function(module, ancestors) {
            if (self.moduleDefine[module]) {
                if (self.moduleDefine[module].executed) {
                    return self.moduleReturn[module];
                }

                var dependencies = self.moduleDefine[module].dependencies;
                var depExports = [];

                for (var i = 0; i < dependencies.length; i++) {
                    var dependency = self.overrideMapDependency(dependencies[i], module);

                    if (dependency === 'exports') {
                        self.moduleReturn[module] = {};
                        depExports.push(self.moduleReturn[module]);
                    } else if (dependency === 'require') {
                        depExports.push(self.require);
                    } else if (ancestors.indexOf(dependency) !== -1) {
                        // we found a loop dependency
                        depExports.push(self.moduleReturn[dependency]);
                    } else if (dependency.indexOf('!') !== -1) {
                        var pluginTest = dependency.split('!');

                        var plugin = pluginTest[0];
                        dependency = pluginTest[1];

                        var depAncestors = self.copyArray(ancestors);
                        depAncestors.push(module);

                        var pluginResult = self.execute(plugin, ancestors);

                        pluginResult.load(
                            dependency,
                            self.require,
                            function(value) {
                                self.moduleReturn[dependency] = value;
                            },
                            {}
                        );

                        depExports.push(self.moduleReturn[dependency]);
                    } else {
                        var depAncestors = self.copyArray(ancestors);
                        depAncestors.push(module);
                        depExports.push(self.execute(dependency, depAncestors));
                    }
                }

                var result = self.moduleDefine[module].callback.apply(undefined, depExports);

                if (self.moduleShim[module]) {
                    result = self.moduleShim[module].callback.apply(undefined, depExports);
                }

                self.moduleDefine[module].executed = true;

                if (result) {
                    self.moduleReturn[module] = result;
                }

                self.setAmdModuleName(self.moduleReturn[module], module);

                return self.moduleReturn[module];
            } else {
                if (/\.tpl$/.test(module)) {
                    return undefined;
                }

                console.error('Module "' + module + '" not found');
            }
        };

        this.copyArray = function(arr) {
            var newArr = [];

            for (var i = 0; i < arr.length; i++) {
                newArr.push(arr[i]);
            }

            return newArr;
        };

        this.deepExtend = function(target, source) {
            if (Array.isArray(target) || typeof target !== 'object') {
                return source;
            }

            for (var key in source) {
                if (key in target) {
                    target[key] = self.deepExtend(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }

            return target;
        };

        this.isInEcmaScriptModule = function(module, component) {
            if (typeof module === 'object' && module.__esModule) {
                for (var exportedElement in module) {
                    return (
                        module.hasOwnProperty(exportedElement) &&
                        module[exportedElement] === component
                    );
                }
            }
        };

        // This method will add the property '_AMDModuleName' to the modules
        // So when we require them in SC (in special with the Views)
        // the module will know his own module name
        this.setModuleName = function(module, name) {
            if (module._AMDModuleName === undefined) {
                module._AMDModuleName = [name];
                return;
            }
            var existingModule = self.require(module._AMDModuleName[0]);
            if (existingModule === module || self.isInEcmaScriptModule(existingModule, module)) {
                module._AMDModuleName.push(name);
            } else {
                module._AMDModuleName = [name];
            }
        };

        this.setAmdModuleName = function(module, name) {
            if (module && typeof module === 'object' && module.__esModule) {
                // Assign the AMD module name to each function exported in
                // an ECMAScript module
                for (var property in module) {
                    if (module.hasOwnProperty(property) && typeof module[property] === 'function') {
                        self.setModuleName(module[property], name);
                    }
                }
            } else if (typeof module === 'function') {
                self.setModuleName(module, name);
            }
        };
    }
    var isNode =
        typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

    if (isNode) {
        module.exports = ModuleLoader;
    } else {
        var ml = new ModuleLoader();
        define = ml.define;
        require = ml.require;
        requirejs = ml.require;
    }
})();
