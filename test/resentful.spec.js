const Resentful = require('../lib/resentful.js');
const expect  = require("chai").expect;
const inputJson = require('./input.json');
const outputJson = require('./output.json');
const _  = require("lodash");

describe("Resentful", function () {
    let resentful;
    let input;
    let output;

    beforeEach(function () {
        resentful = new Resentful();
        input = _.cloneDeep(inputJson);
        output = _.cloneDeep(outputJson);
    });

    it('should produce expected output', function () {
        const actual = resentful.reduce(input);
        const expected = output;
        expect(actual).to.deep.equal(output);
    });

    it('should allow specification of a pre-mapper', function () {
        let expected = output;
        let actual;

        _.merge(expected, {
            nestedConfig: {
                meta: {
                    contentType: 'nestedConfig'
                },
                grandchildConfig: {
                    meta: {
                        contentType: 'nestedConfig'
                    }
                }
            }
        });

        resentful.registerMappers('nestedConfig', (entry) => {
            return _.set(entry, 'fields.meta', {
                contentType: entry.sys.contentType.sys.id
            });
        });

        actual = resentful.reduce(input);
        expect(actual).to.deep.equal(expected);
    });

    it('should allow specification of a post-mapper', function () {
        let expected = output;
        let actual;

        _.merge(expected, {
            nestedConfig: {
                meta: {
                    contentType: 'nestedConfig'
                },
                grandchildConfig: {
                    meta: {
                        contentType: 'nestedConfig'
                    }
                }
            }
        });

        resentful.registerMappers('nestedConfig', null, (entry) => {
            return _.set(entry, 'meta', {
                contentType: 'nestedConfig'
            });
        });

        actual = resentful.reduce(input);
        expect(actual).to.deep.equal(expected);
    });

    it('should allow specification of pre- and post-mappers', function () {
        let expected = output;
        let actual;

        _.merge(expected, {
            nestedConfig: {
                meta: {
                    contentType: 'nestedConfig',
                    contentType2: 'nestedConfig'
                },
                grandchildConfig: {
                    meta: {
                        contentType: 'nestedConfig',
                        contentType2: 'nestedConfig'
                    }
                }
            }
        });

        resentful.registerMappers(
            'nestedConfig',
            (entry) => {
                return _.set(entry, 'fields.meta', {
                    contentType: entry.sys.contentType.sys.id
                });
            },
            (entry) => {
                return _.set(entry, 'meta', _.extend(entry.meta, {
                    contentType2: entry.meta.contentType
                }));
            });

        actual = resentful.reduce(input);
        expect(actual).to.deep.equal(expected);
    });

    it('should not overwrite prior mappers with falsy values', function () {
        let expected = output;
        let actual;

        _.merge(expected, {
            nestedConfig: {
                meta: {
                    contentType: 'nestedConfig',
                    contentType2: 'nestedConfig'
                },
                grandchildConfig: {
                    meta: {
                        contentType: 'nestedConfig',
                        contentType2: 'nestedConfig'
                    }
                }
            }
        });

        resentful.registerMappers('nestedConfig', (entry) => {
            return _.set(entry, 'fields.meta', {
                contentType: entry.sys.contentType.sys.id
            });
        });

        resentful.registerMappers('nestedConfig', null, (entry) => {
            return _.set(entry, 'meta', _.extend(entry.meta, {
                contentType2: entry.meta.contentType
            }));
        });

        actual = resentful.reduce(input);
        expect(actual).to.deep.equal(expected);
    });

});
