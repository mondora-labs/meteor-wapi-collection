var BPromise = require("bluebird");
var R        = require("ramda");

var genericMethods = require("./methods.js");

var Collection = function (mw, name) {
    this.mw = mw;
    this.name = name;
    this.createDbProxy();
    this.attachMethods();
    this.initValidationRules();
};

/*
*   Create the dbCollection proxy
*/
Collection.prototype.createDbProxy = function createDbProxy () {
    var collection = this.mw.db.collection(this.name);
    this.dbCollection = {
        findOne: BPromise.promisify(collection.findOne, collection),
        insert: BPromise.promisify(collection.insert, collection),
        update: BPromise.promisify(collection.update, collection),
        remove: BPromise.promisify(collection.remove, collection)
    };
};

/*
*   Attach methods to collection's mw instance
*/
Collection.prototype.attachMethods = function attachMethods () {
    var methods = {};
    methods["/" + this.name + "/insert"] = R.partial(genericMethods.insert, this);
    methods["/" + this.name + "/update"] = R.partial(genericMethods.update, this);
    methods["/" + this.name + "/remove"] = R.partial(genericMethods.remove, this);
    this.mw.methods(methods);
};

/*
*   Init the validationRules store
*/
Collection.prototype.initValidationRules = function initValidationRules () {
    this.validationRules = {
        insert: [],
        update: [],
        remove: []
    };
};

/*
*   Validation rules can either:
*
*   - throw or return a value (which is ignored)
*   - return a promise which either gets fullfilled (with a value which is
*     ignored) or rejected
*
*   If the rule returns a value (even undefined) or an eventually fulfilled
*   promise, the value (fulfillment-value) is ignored and the operation
*   continues (after subsequent rules are run).
*
*   If a rule throws, or returns a promise which gets rejected, the operation is
*   aborted (subsequent rules won't run). If the error thrown (or passed as
*   rejection value of the promise) is an instance of a MW.Error, then it'll get
*   sent back to the client. Otherwise, a generic "500 Internal server error"
*   error will be sent.
*
*/
Collection.prototype.addValidationRules = function addValidationRules (ruleSet) {
    if (ruleSet.insert) {
        this.validationRules.insert.push(ruleSet.insert);
    }
    if (ruleSet.update) {
        this.validationRules.update.push(ruleSet.update);
    }
    if (ruleSet.remove) {
        this.validationRules.remove.push(ruleSet.remove);
    }
    /* Allow method chaining */
    return this;
};
Collection.prototype.runValidationRules = function runValidationRules (context, method, oldDocument, newDocument) {
    return BPromise.map(this.validationRules[method], function (rule) {
        if (method === "insert") {
            return rule.call(context, R.clone(newDocument));
        }
        if (method === "update") {
            return rule.call(context, R.clone(oldDocument), R.clone(newDocument));
        }
        if (method === "remove") {
            return rule.call(context, R.clone(oldDocument));
        }
    });
};

module.exports = Collection;
