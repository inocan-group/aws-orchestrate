'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class TypedMapper {
    constructor() {
        this._passthrough = false;
        this._exclude = false;
    }
    static map(config) {
        const obj = new TypedMapper();
        obj.map(config);
        return obj;
    }
    static passthrough(config) {
        const obj = new TypedMapper();
        obj.passthrough(config);
        return obj;
    }
    static exclude(config) {
        const obj = new TypedMapper();
        obj.exclude(config);
        return obj;
    }
    static aggregate(config) {
        const obj = new TypedMapper();
        obj.aggregate(config);
        return obj;
    }
    get mapConfig() {
        return this._map;
    }
    map(config) {
        this._map = config;
        return this;
    }
    passthrough(config) {
        if (this._exclude) {
            const e = new Error(`You can't set both passthroughs and exclusions and exclusions are already set!`);
            e.name = "TypedMapper::NotAllowed";
            throw e;
        }
        this._passthrough = config;
        return this;
    }
    exclude(config) {
        if (this._passthrough) {
            const e = new Error(`You can't set both passthroughs and exclusions and passthroughs are already set!`);
            e.name = "TypedMapper::NotAllowed";
            throw e;
        }
        this._exclude = config;
        return this;
    }
    input(data) {
        this._data = data;
        return this;
    }
    get inputData() {
        return this._data;
    }
    /**
     * Converts the input data, using the mapping configuration,
     * into the output format.
     */
    convert(data) {
        if (data) {
            this.input(data);
        }
        if (!this._data) {
            const e = new Error("You must first set the data before trying to convert!");
            e.name = "TypedMapper::NotReady";
            throw e;
        }
        return Array.isArray(this._data)
            ? this._convertArray(this._data)
            : this._convertObject(this._data);
    }
    convertArray(data) {
        if (!data && !Array.isArray(this._data)) {
            const e = new Error(`Using convertArray() requires that the input is also an array and it is of type ${typeof this
                ._data}`);
            e.name = "TypedMapper::InvalidFormat";
            throw e;
        }
        return this.convert(data);
    }
    convertObject(data) {
        if (!data && Array.isArray(this._data)) {
            const e = new Error(`Using convertObject() requires that the input is an object and it is of type ${typeof this
                ._data}`);
            e.name = "TypedMapper::InvalidFormat";
            throw e;
        }
        return this.convert(data);
    }
    _convertObject(data, arr = []) {
        if (!this._map) {
            throw new Error(`Attempt convert an object failed because there was no Mapper defined yet!`);
        }
        const output = {};
        const keys = Object.keys(this._map);
        for (const key of keys) {
            const prop = this._map[key];
            // cheating a bit on below typing but its pissing me off and runtime works fine
            output[key] = typeof prop === "function" ? prop(data, arr) : data[prop];
        }
        // passthroughs
        if (this._passthrough) {
            const pkeys = Array.isArray(this._passthrough) ? this._passthrough : Object.keys(data);
            for (const key of pkeys) {
                output[key] = data[key];
            }
        }
        // exclusions
        if (Array.isArray(this._exclude)) {
            const exclude = new Set(this._exclude);
            const ekeys = Object.keys(data).filter(e => !exclude.has(e));
            for (const key of ekeys) {
                output[key] = data[key];
            }
        }
        return output;
    }
    _convertArray(data) {
        const output = [];
        for (const datum of data) {
            output.push(this._convertObject(datum));
        }
        return output;
    }
    /**
     * Converts input data into an aggregate record
     */
    aggregate(config) {
        if (this._map) {
            const e = new Error('A TypedMapper object should NOT have a "map" and "aggregate" configuration and this object already has a "map" configuration!');
            e.name = "TypedMapper::NotAllowed";
            throw e;
        }
        this._aggregate = config;
        return this;
    }
}

function dasherize(name) {
    return name
        .split(/[_\s\.]/g)
        .map(val => {
        return (val.charAt(0).toLowerCase() +
            val
                .substr(1)
                .replace(/([A-Z])/gm, "-$1")
                .toLowerCase());
    })
        .join("-");
}
function camelize(name) {
    return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
        return agg !== ""
            ? agg + val.charAt(0).toUpperCase() + val.substr(1)
            : val.charAt(0).toLowerCase() + val.substr(1);
    }, "");
}
function pascalize(name) {
    return name.split(/[_\s-\.]/gm).reduce((agg, val) => {
        return agg + val.charAt(0).toUpperCase() + val.substr(1);
    }, "");
}

var ErrorKind;
(function (ErrorKind) {
    ErrorKind["AppError"] = "AppError";
    ErrorKind["LibraryError"] = "LibraryError";
    ErrorKind["ApiGatewayError"] = "ApiGatewayError";
})(ErrorKind || (ErrorKind = {}));

//#endregion class-interfaces
function createLibraryError(
/**
 * The library's name
 */
library, 
/**
 * Default options
 */
defaultOptions = {}) {
    /**
     * An Error thrown by library code which does _not_ require a numeric
     * HTTP error code on each throw. You may, however, include one where appropriate,
     * and you have the option when configuring the error to state a "default" HTTP code
     * (though no default will be provided unless you state it)
     *
     * Unlike, `AppError`'s, the `LibraryError` _does_ require that a string based code be
     * included (versus being defaulted to 'error'). This ensures that consumers of the library
     * can build conditional logic off of a reasonable
     */
    class LibraryError extends Error {
        /**
         *
         * @param message a string-based, human friendly message to present to the user; because this is considered an `AppError` the name of the application -- in brackets -- will be prefixed
         * to the text included here in the message
         * @param code A string-based classification of the error; this aligns with the
         * latest versions of Node which has a string based "code". This code will _also_
         * be included as part of the `classification` property
         * @param options a dictionary of params you _can_ but are _not required_ to set
         */
        constructor(message, code, options = {}) {
            super(`[ ${library} ]: ${message}`);
            this.kind = ErrorKind.LibraryError;
            this.library = library;
            const opts = { ...defaultOptions, ...options };
            this.code = code;
            this.classification = `${library}/${code}`;
            if (opts.errorCode) {
                this.errorCode = opts.errorCode;
            }
        }
    }
    return LibraryError;
}

const MapperError = createLibraryError("typed-mapper");

exports.MapperError = MapperError;
exports.TypedMapper = TypedMapper;
exports.camelize = camelize;
exports.dasherize = dasherize;
exports.pascalize = pascalize;
