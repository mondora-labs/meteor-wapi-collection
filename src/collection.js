var BPromise = require("bluebird");
var R        = require("ramda");

var genericMethods = require("./methods.js");

var Collection = function (mw, name) {
    this.mw = mw;
    this.name = name;
    this.validationRules = {
        insert: [],
        update: [],
        remove: []
    };
    this.db = BPromise.promisifyAll(
        mw.db.collection(name)
    );
    this.attachMethods();
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
*   Validation rules can either:
*
*   - throw or return a value (which is ignored)
*   - return a promise which either gets fullfilled (with a value which is
*     ignored) or rejected
*
*   If a rule throws, or returns a promise which gets rejected, the operation is
*   aborted. If the error thrown (or passed as rejection value of the promise)
*   is an instance of a MW.Error, then it'll get sent back to the client.
*   Otherwise, a generic "500 Internal server error" error will be sent.
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
