/* eslint-disable */

var moduleConstructor = require('../module-loader');
var mod;

class Script {
    constructor() {
        this.attr = {};
    }

    setAttribute(attr, value) {
        this.attr[attr] = value;
    }
    addEventListener(type, callback) {
        this[type] = callback;
    }
    getAttribute(attr) {
        return this.attr[attr];
    }
}

var originalCreateElement = document.createElement;
var originalHeadAppendChild = document.head.appendChild;
var originalHeadRemoveChild = document.head.removeChild;

describe('Module Loader', () => {
    var resetModuleLoader = () => {
        Object.defineProperty(document, 'createElement', {
            writable: true,
            value: originalCreateElement
        });

        Object.defineProperty(document.head, 'appendChild', {
            writable: true,
            value: originalHeadAppendChild
        });

        Object.defineProperty(document.head, 'removeChild', {
            writable: true,
            value: originalHeadRemoveChild
        });

        var ml = new moduleConstructor();
        mod = {
            require: ml.require,
            define: ml.define,
            requirejs: ml.requirejs
        };
    };

    var setDocumentMethods = () => {
        resetModuleLoader();

        Object.defineProperty(document, 'createElement', {
            writable: true,
            value: name => {
                if (name === 'script') {
                    return new Script();
                }
            }
        });

        Object.defineProperty(document.head, 'removeChild', {
            writable: true,
            value: script => {}
        });
    };

    describe('Define simple module with no dependencies', () => {
        beforeEach(resetModuleLoader);

        it('Require module with no callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            var test = mod.requirejs('Test');
            expect(test).toEqual({ name: 'Test' });

            cb();
        });

        it('Require module with callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.requirejs(['Test'], test => {
                expect(test).toEqual({ name: 'Test' });

                cb();
            });
        });

        it('Require module with empty dependencies', cb => {
            mod.define('Test', [], () => {
                return { name: 'Test' };
            });

            mod.requirejs(['Test'], test => {
                expect(test).toEqual({ name: 'Test' });

                cb();
            });
        });

        it('Require module should execute the callback when required', cb => {
            var a = 0;
            mod.define('Test', () => {
                a++;
            });

            expect(a).toBe(0);
            mod.requirejs('Test');
            expect(a).toBe(1);

            cb();
        });

        it('Require module should execute the callback once', cb => {
            var a = 0;
            mod.define('Test', () => {
                a++;
            });

            mod.requirejs('Test');
            expect(a).toBe(1);
            mod.requirejs('Test');
            expect(a).toBe(1);

            cb();
        });
    });

    describe('Define multiple simple modules with no dependencies', () => {
        beforeEach(resetModuleLoader);

        it('Require module with no callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Another', () => {
                return { name: 'Another' };
            });

            var test = mod.requirejs('Test');
            expect(test).toEqual({ name: 'Test' });
            var another = mod.requirejs('Another');
            expect(another).toEqual({ name: 'Another' });

            cb();
        });

        it('Require modules with callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Another', () => {
                return { name: 'Another' };
            });

            mod.requirejs(['Test', 'Another'], (test, another) => {
                expect(test).toEqual({ name: 'Test' });
                expect(another).toEqual({ name: 'Another' });

                cb();
            });
        });
    });

    describe('Define multiple modules with dependencies', () => {
        beforeEach(resetModuleLoader);

        it('Require modules with dependency', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Another', ['Test'], test => {
                return {
                    name: 'Another',
                    test: test.name
                };
            });

            mod.requirejs(['Another'], another => {
                expect(another).toEqual({
                    name: 'Another',
                    test: 'Test'
                });

                cb();
            });
        });

        it('Require modules with no existing dependency', cb => {
            mod.define('Another', ['Test'], test => {
                return {
                    name: 'Another',
                    test: test.name
                };
            });

            expect(() => {
                mod.requirejs('Another');
            }).toThrow('Module "Test" not found');

            cb();
        });

        it('Require modules with no existing template dependency', cb => {
            mod.define('Another', ['template.tpl'], template_tpl => {
                return {
                    tempalte: template_tpl
                };
            });

            expect(() => {
                mod.requirejs('Another', another => {
                    expect(another.template).toBeUnmod.defined();
                });
            }).not.toThrow('Module "template.tpl" not found');

            cb();
        });

        it('Require modules with plugin dependency', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('SomePlugin', () => {
                return {
                    load: (name, req, onload, config) => {
                        req([name], value => {
                            value.name += ' with SomePlugin';
                            onload(value);
                        });
                    }
                };
            });

            mod.define('Another', ['SomePlugin!Test'], test => {
                return {
                    name: 'Another',
                    test: test.name
                };
            });

            mod.requirejs(['Another'], another => {
                expect(another).toEqual({ name: 'Another', test: 'Test with SomePlugin' });
                cb();
            });
        });

        it('Require modules with multiple level dependency', cb => {
            mod.define('Level1', () => {
                return { name: 'Level1' };
            });

            mod.define('Level2', ['Level1'], level1 => {
                return { name: `Level2 ${level1.name}` };
            });

            mod.define('Level3', ['Level2'], level2 => {
                return { name: `Level3 ${level2.name}` };
            });

            mod.requirejs(['Level3'], level3 => {
                expect(level3).toEqual({
                    name: 'Level3 Level2 Level1'
                });

                cb();
            });
        });

        it('Require modules with loop dependency', cb => {
            mod.define('Level1', ['Level3'], level3 => {
                return { name: `Level1 ${level3}` };
            });

            mod.define('Level2', ['Level1'], level1 => {
                return { name: `Level2 ${level1.name}` };
            });

            mod.define('Level3', ['Level2'], level2 => {
                return { name: `Level3 ${level2.name}` };
            });

            mod.requirejs(['Level3'], level3 => {
                expect(level3).toEqual({
                    name: 'Level3 Level2 Level1 undefined'
                });

                cb();
            });
        });

        it('Require modules with loop dependency using exports', cb => {
            mod.define('Level1', ['exports', 'Level3'], (exports, level3) => {
                return { name: `Level1 ${level3.name}` };
            });

            mod.define('Level2', ['exports', 'Level1'], (exports, level1) => {
                return { name: `Level2 ${level1.name}` };
            });

            mod.define('Level3', ['exports', 'Level2'], (exports, level2) => {
                return { name: `Level3 ${level2.name}` };
            });

            mod.requirejs(['Level3'], level3 => {
                expect(level3).toEqual({
                    name: 'Level3 Level2 Level1 undefined'
                });

                cb();
            });
        });
    });

    describe('_AMDModuleName', () => {
        beforeEach(resetModuleLoader);

        it('Check AMD Module Name on a function', cb => {
            mod.define('Test', () => {
                var constructor = () => {};
                constructor.__esModule = true;
                return constructor;
            });

            mod.requirejs(['Test'], test => {
                expect(test._AMDModuleName).toEqual(['Test']);

                cb();
            });
        });

        it('Check AMD Module Name on functions of an object', cb => {
            mod.define('Test', () => {
                var obj = {
                    method1: () => {},
                    method2: () => {},
                    method3: () => {}
                };
                obj.__esModule = true;
                return obj;
            });

            mod.requirejs(['Test'], test => {
                expect(test.method1._AMDModuleName).toEqual(['Test']);
                expect(test.method2._AMDModuleName).toEqual(['Test']);
                expect(test.method3._AMDModuleName).toEqual(['Test']);

                cb();
            });
        });

        it('Check multiple AMD Module Name', cb => {
            mod.define('Test', () => {
                var constructor = () => {};
                constructor.__esModule = true;
                return constructor;
            });

            mod.define('Another', ['Test'], test => {
                return test;
            });

            mod.requirejs(['Test'], test => {
                expect(test._AMDModuleName).toEqual(['Test']);
            });

            mod.requirejs(['Another'], test => {
                expect(test._AMDModuleName).toEqual(['Test', 'Another']);
            });

            mod.requirejs(['Test'], test => {
                expect(test._AMDModuleName).toEqual(['Test', 'Another']);

                cb();
            });
        });
    });

    describe('Define module with "require" dependency', () => {
        beforeEach(resetModuleLoader);

        it('Require modules with callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Another', ['require'], requireLocal => {
                requireLocal(['Test'], test => {
                    expect(test).toEqual({ name: 'Test' });

                    cb();
                });
            });

            mod.requirejs('Another');
        });

        it('Require modules without callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Another', ['require'], requireLocal => {
                var test = requireLocal('Test');

                expect(test).toEqual({ name: 'Test' });

                cb();
            });

            mod.requirejs(['Another']);
        });
    });

    describe('Define module with "exports" dependency', () => {
        beforeEach(resetModuleLoader);

        it('Require modules with callback', cb => {
            mod.define('Test', ['exports'], exports => {
                exports.Test = { name: 'Test' };
            });

            mod.requirejs(['Test'], test => {
                expect(test.Test).toEqual({ name: 'Test' });

                cb();
            });
        });

        it('Require modules without callback', cb => {
            mod.define('Test', ['exports'], exports => {
                exports.Test = { name: 'Test' };
            });

            var test = mod.requirejs('Test');

            expect(test.Test).toEqual({ name: 'Test' });

            cb();
        });
    });

    describe('Define module with "exports", "require" and a dependency', () => {
        beforeEach(resetModuleLoader);

        it('Require multiple special modules with callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Inside', [], () => {
                return { name: 'Inside' };
            });

            mod.define('Another', ['exports', 'require', 'Test'], (exp, req, test) => {
                var inside = req('Inside');
                exp.name = `Another ${test.name} ${inside.name}`;
            });

            mod.requirejs(['Another'], another => {
                expect(another).toEqual({ name: 'Another Test Inside' });

                cb();
            });
        });

        it('Require multiple special modules without callback', cb => {
            mod.define('Test', () => {
                return { name: 'Test' };
            });

            mod.define('Inside', [], () => {
                return { name: 'Inside' };
            });

            mod.define('Another', ['exports', 'require', 'Test'], (exp, req, test) => {
                var inside = req('Inside');
                exp.name = `Another ${test.name} ${inside.name}`;
            });

            var another = mod.requirejs('Another');

            expect(another).toEqual({ name: 'Another Test Inside' });

            cb();
        });
    });

    describe('Define simple module with no dependencies async', () => {
        beforeEach(setDocumentMethods);

        it('Define module without name', cb => {
            Object.defineProperty(document.head, 'appendChild', {
                writable: true,
                value: script => {
                    mod.define(() => {
                        return { name: 'Test' };
                    });

                    expect(script.src).toBe('http://mywebsite.com/test.js');

                    script.load();
                }
            });

            mod.requirejs.config({ paths: { Test: 'test.js' }, baseUrl: 'http://mywebsite.com' });

            mod.requirejs(['Test'], test => {
                expect(test).toEqual({ name: 'Test' });

                cb();
            });
        });

        it('Require module with callback', cb => {
            Object.defineProperty(document.head, 'appendChild', {
                writable: true,
                value: script => {
                    expect(script.src).toBe('Test.js');

                    setTimeout(() => {
                        mod.define('Test', () => {
                            return { name: 'Test' };
                        });

                        script.load();
                    }, 200);
                }
            });

            mod.requirejs(['Test'], test => {
                expect(test).toEqual({ name: 'Test' });

                cb();
            });
        });
    });

    describe('Define multiple modules with dependencies async', () => {
        beforeEach(setDocumentMethods);

        it('Require modules with plugin dependency', cb => {
            Object.defineProperty(document.head, 'appendChild', {
                writable: true,
                value: script => {
                    switch (script.src) {
                        case 'Test.js':
                            setTimeout(() => {
                                mod.define('Test', () => {
                                    return { name: 'Test' };
                                });

                                script.load();
                            }, 200);
                            break;
                        case 'Another.js':
                            setTimeout(() => {
                                mod.define('Another', ['SomePlugin!Test'], test => {
                                    return {
                                        name: 'Another',
                                        test: test.name
                                    };
                                });
                                script.load();
                            }, 150);
                            break;
                        case 'SomePlugin.js':
                            setTimeout(() => {
                                mod.define('SomePlugin', () => {
                                    return {
                                        load: (name, req, onload, config) => {
                                            req([name], value => {
                                                value.name += ' with SomePlugin';
                                                onload(value);
                                            });
                                        }
                                    };
                                });
                                script.load();
                            }, 250);
                            break;
                        default:
                    }
                }
            });

            mod.requirejs(['Another'], another => {
                expect(another).toEqual({ name: 'Another', test: 'Test with SomePlugin' });
                cb();
            });
        });

        it('Require modules with loop dependency', cb => {
            Object.defineProperty(document.head, 'appendChild', {
                writable: true,
                value: script => {
                    switch (script.src) {
                        case 'Level1.js':
                            setTimeout(() => {
                                mod.define('Level1', ['Level3'], level3 => {
                                    return { name: `Level1 ${level3}` };
                                });

                                script.load();
                            }, 200);
                            break;
                        case 'Level2.js':
                            setTimeout(() => {
                                mod.define('Level2', ['Level1'], level1 => {
                                    return { name: `Level2 ${level1.name}` };
                                });
                                script.load();
                            }, 150);
                            break;
                        case 'Level3.js':
                            setTimeout(() => {
                                mod.define('Level3', ['Level2'], level2 => {
                                    return { name: `Level3 ${level2.name}` };
                                });
                                script.load();
                            }, 250);
                            break;
                        default:
                    }
                }
            });

            mod.requirejs(['Level3'], level3 => {
                expect(level3).toEqual({
                    name: 'Level3 Level2 Level1 undefined'
                });

                cb();
            });
        });

        it('Require modules with loop dependency using exports', cb => {
            Object.defineProperty(document.head, 'appendChild', {
                writable: true,
                value: script => {
                    switch (script.src) {
                        case 'Level1.js':
                            setTimeout(() => {
                                mod.define('Level1', ['exports', 'Level3'], (exports, level3) => {
                                    return { name: `Level1 ${level3.name}` };
                                });

                                script.load();
                            }, 200);
                            break;
                        case 'Level2.js':
                            setTimeout(() => {
                                mod.define('Level2', ['exports', 'Level1'], (exports, level1) => {
                                    return { name: `Level2 ${level1.name}` };
                                });
                                script.load();
                            }, 150);
                            break;
                        case 'Level3.js':
                            setTimeout(() => {
                                mod.define('Level3', ['exports', 'Level2'], (exports, level2) => {
                                    return { name: `Level3 ${level2.name}` };
                                });
                                script.load();
                            }, 250);
                            break;
                        default:
                    }
                }
            });

            mod.requirejs(['Level3'], level3 => {
                expect(level3).toEqual({
                    name: 'Level3 Level2 Level1 undefined'
                });

                cb();
            });
        });

        /*it('Require modules with no existing dependency', cb => {
            Object.defineProperty(document.head, 'appendChild', {
                writable: true,
                value: script => {
                    switch (script.src) {
                        case 'Another.js':
                            script.error();
                            break;
                        default:
                    }
                }
            });

            expect(() => {
                mod.requirejs(['Another']);
				cb();
            }).toThrow('Module "Another" on "Another.js" not found');
        });*/
    });
});
