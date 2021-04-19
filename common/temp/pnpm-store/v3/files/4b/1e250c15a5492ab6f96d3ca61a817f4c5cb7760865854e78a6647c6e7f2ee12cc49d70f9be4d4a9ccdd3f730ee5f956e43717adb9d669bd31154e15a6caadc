"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPathFromNameComponents = exports.SSM = void 0;
const aws_sdk_1 = require("aws-sdk");
const getAwsCredentials_1 = require("./getAwsCredentials");
const parseForNameComponents_1 = require("./parseForNameComponents");
const utils_1 = require("./utils");
__exportStar(require("./parseForNameComponents"), exports);
__exportStar(require("./types"), exports);
class SSM {
    constructor(config = {}) {
        this._cli = false;
        if (config.profile && typeof config.profile === "string") {
            const credentials = config.credentialsDirectory
                ? getAwsCredentials_1.getAwsCredentials(config.profile, config.credentialsDirectory)
                : getAwsCredentials_1.getAwsCredentials(config.profile);
            config.region = config.region ? config.region : credentials.region;
            delete credentials.region;
            this._credentials = credentials;
        }
        else if (config.profile) {
            this._credentials = config.profile;
        }
        this._cli = config.cli ? config.cli : false;
        this._region = config.region;
        this._defaultType = config.defaultType || "SecureString";
        const awsSsmConfig = {
            apiVersion: "2014-11-06",
            region: this._region
        };
        if (this._credentials) {
            awsSsmConfig.credentials = this._credentials;
        }
        this._ssm = new aws_sdk_1.SSM(awsSsmConfig);
    }
    /**
     * Instantiates SSM using the default configuration and calls the `module` instance method.
     */
    static async modules(mods, options = {}) {
        return options.config
            ? new SSM(options.config).modules(mods, options)
            : new SSM().modules(mods, options);
    }
    get configuration() {
        return {
            credentials: this._credentials,
            cli: this._cli,
            region: this._region,
            defaultType: this._defaultType
        };
    }
    async get(Name, options = {}) {
        const request = {
            Name: options.nonStandardPath
                ? Name
                : buildPathFromNameComponents(parseForNameComponents_1.parseForNameComponents(Name))
        };
        if (options.decrypt) {
            request.WithDecryption = true;
        }
        const data = await this._ssm.getParameter(request).promise();
        const result = {
            path: data.Parameter.Name,
            type: data.Parameter.Type,
            arn: data.Parameter.ARN,
            version: data.Parameter.Version,
            value: data.Parameter.Value,
            encrypted: !options.decrypt && data.Parameter.Type === "SecureString"
                ? true
                : false,
            lastUpdated: data.Parameter.LastModifiedDate
        };
        return result;
    }
    async convertToEnv(Name, options = {}) {
        const result = await this.get(Name, options);
        if (result.encrypted) {
            const e = new Error(`Can not convert to ENV an encrypted value at "${Name}"; always use { decrypt: true } config.`);
            e.name = "NotAllowed";
            throw e;
        }
        const varName = `${result.parts.module.toUpperCase()}_${result.parts.name.toUpperCase()}`;
        process.env[varName] = String(result.value);
    }
    /**
     * put
     *
     * Puts a value into SSM and then returns the version number
     * on success.
     *
     * @param Name The name/path of the variable
     * @param Value The value to set to
     * @param options Any additional options needed
     */
    async put(Name, Value, options = {}) {
        const parts = parseForNameComponents_1.parseForNameComponents(Name);
        Value = utils_1.coerceValueToString(Value);
        const Description = options.description
            ? options.description
            : Boolean(options.override)
                ? await utils_1.findPriorDescription(Name)
                : "";
        const request = {
            Name,
            Value,
            Description,
            Overwrite: options.override || false,
            Type: options.encrypt !== undefined
                ? options.encrypt
                    ? "SecureString"
                    : "String"
                : this._defaultType
        };
        if (options.encryptionKey) {
            request.KeyId = options.encryptionKey;
        }
        const result = await this._ssm.putParameter(request).promise();
        return result.Version;
    }
    /**
     * list
     *
     * Lists the SSM Parameters available. If you wish to have a scoped/subset of parameters
     * you should use optional "options" parameter. When you pass in a "string" this is
     * the same as setting the "path" option but does remove your ability to set other options.
     *
     * @param pathOrOptions the hierarchical path position to start the recursive
     * search for parameters, OR a configuration object
     */
    async list(pathOrOptions = { path: "/" }) {
        const o = typeof pathOrOptions === "string"
            ? { path: pathOrOptions }
            : pathOrOptions;
        const request = {
            Path: o.path || "/",
            Recursive: true,
            WithDecryption: o.decrypt
        };
        const ssmParameters = [];
        let response;
        do {
            response = await this._ssm.getParametersByPath(request).promise();
            ssmParameters.push(...response.Parameters);
        } while (response.NextToken && (request.NextToken = response.NextToken));
        const parameters = ssmParameters.map(i => (Object.assign(Object.assign({}, i), { encrypted: o.decrypt ? false : true })));
        return parameters;
    }
    /**
     * Produces a list of SSM parameters; this is very similar to the `list()` method
     * but the data that is returned includes the last person/user to touch the value
     * and _does not_ include the value of the secret.
     */
    async describeParameters(options = { MaxResults: 50 }) {
        const describeParameters = this._ssm.describeParameters(options).promise();
        let results = await describeParameters;
        if (results.NextToken) {
            options.NextToken = results.NextToken;
            const r2 = await this._ssm.describeParameters(options).promise();
            results.Parameters = results.Parameters.concat(r2.Parameters);
        }
        return results.Parameters;
    }
    /**
     * values
     *
     * An "alias" to the list() function except that values are decrypted
     *
     * @param path the hierarchical path position to start the recursive
     * search for parameters
     */
    async values(path = "/") {
        return this.list({ path, decrypt: true });
    }
    /**
     * modules
     *
     * returns the list of parameters in the current STAGE which are related to a given
     * module/app. You can optionally specify a specific version.
     *
     * @param mods an array of modules/apps to look for
     * @param options state the explicit app version to use or
     * @return returns a hash who's keys are the module name; each module will be a hash who's keys are the key's property name
     */
    async modules(mods, options = {}) {
        mods = Array.isArray(mods) ? mods : [mods];
        if (!process.env.AWS_STAGE) {
            const err = new Error(`Can not use ssm.modules() without having set AWS_STAGE environment variable first!`);
            err.name = "NotAllowed";
            throw err;
        }
        const params = await this.values("/" + process.env.AWS_STAGE);
        const intermediate = {};
        params.forEach(p => {
            const parts = parseForNameComponents_1.parseForNameComponents(p.Name);
            const { version, module, name } = parts;
            if (mods.indexOf(module) !== -1) {
                if (!intermediate[module]) {
                    intermediate[module] = {};
                }
                if (!intermediate[module][version]) {
                    intermediate[module][version] = {};
                }
                intermediate[module][version][name] = p;
            }
        });
        return mods.reduce((prev, mod) => {
            return Object.assign(Object.assign({}, prev), {
                [mod]: options.version
                    ? utils_1.addModuleName(mod, utils_1.getSpecificVersion(intermediate[mod], options.version, options.verbose), options.verbose)
                    : utils_1.addModuleName(mod, utils_1.getLatestVersion(intermediate[mod], options.verbose), options.verbose)
            });
        }, {});
    }
    async delete(Name, options = {}) {
        const request = {
            Name: buildPathFromNameComponents(parseForNameComponents_1.parseForNameComponents(Name))
        };
        try {
            await this._ssm.deleteParameter(request).promise();
        }
        catch (e) {
            if (e.name === "ParameterNotFound") {
                const err = new Error(`The parameter "${Name}" could not be found!`);
                err.name = "ParameterNotFound";
                err.stack = e.stack;
                throw err;
            }
            else {
                throw e;
            }
        }
    }
}
exports.SSM = SSM;
function buildPathFromNameComponents(parts) {
    const base = `${parts.stage}/${String(parts.version)}`;
    const remaining = parts.module
        ? `/${parts.module}/${parts.name}`
        : `/${parts.name}`;
    return "/" + base + remaining;
}
exports.buildPathFromNameComponents = buildPathFromNameComponents;
//# sourceMappingURL=index.js.map