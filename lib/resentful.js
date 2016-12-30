const _ = require('lodash');

class Resentful {
    constructor() {
        this.preMappers = {};
        this.postMappers = {};
    }

    /**
     * Register pre- and post-mappers for a given contentType
     *
     * @param  {String}   type    Content type of the object to be mapped.
     * @param  {Function} [pre]   Optional pre-mapping function
     * @param  {Function} [post]  Optional post-mapping function
     * @returns {void}
     */
    registerMappers(type, pre, post) {
        const getFn = fn => _.isFunction(fn) ? fn : _.identity;
        this.preMappers[type] = getFn(pre || this.preMappers[type]);
        this.postMappers[type] = getFn(post || this.postMappers[type]);
    }

    /**
     * Take a single contentful config entry, and recursively strip out all
     * of the cruft:
     *
     *   - Remove all 'sys' objects
     *   - Flatten all 'fields' properties
     *
     * @param  {Object} entry  Contentful API entry
     * @return {Object}        Reduced entry
     */
    reduceSingle(entry) {
        const getMapper = (obj, type) => _.get(obj, type, _.identity);
        const contentType = _.get(entry, 'sys.contentType.sys.id');
        const pre = getMapper(this.preMappers, contentType);
        const post = getMapper(this.postMappers, contentType);
        const _reduceSingle = this.reduceSingle.bind(this);

        if (_.isArray(entry)) {
            // This is an array, return a new array with each element having been
            // processed recursively
            return _.map(entry, _.flow(pre, _reduceSingle, post));
        } else if (_.isObject(entry)) {
            if (_.has(entry, 'fields')) {
                // This is a sys/fields object, we only care about the 'fields'
                // entries, so recurse on each value of that object, preserving
                // the key names
                return post(_.mapValues(_reduceSingle(_.get(pre(entry), 'fields'))));
            } else if (!_.has(entry, 'sys')) {
                // This is just a normal object without 'fields' or 'sys', so we
                // want to recurse on each property directly
                return _.mapValues(entry, _.flow(pre, _reduceSingle, post));
            }
        }

        // This is a primitive value, just return it directly
        return entry;
    }

    /**
     * Take a root level contentful API response entry, and recursively strip
     * out all of the cruft using reduceSingle on the root `data[0].fields`
     * object.
     *
     * @param  {Object} data  Contentful API response
     * @return {Object}       Reduced response
     */
    reduce(data) {
        var _reduceSingle = this.reduceSingle.bind(this);
        return _.reduce(data[0].fields,
                        (accum, value, field) =>
                            _.set(accum, field, _reduceSingle(value)),
                        {});
    }
}

module.exports = Resentful;
