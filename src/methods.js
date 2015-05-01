var BPromise = require("bluebird");
var MW       = require("meteor-wapi");
var R        = require("ramda");
var t        = require("tcomb");

var applyPatches   = require("./lib/apply-patches.js");
var argMatches     = require("./lib/arg-matches.js");
var ensure         = require("./lib/ensure.js");
var getOldDocument = require("./lib/get-old-document.js");
var PatchesType    = require("./lib/patches-type.js");
var randomId       = require("./lib/random-id.js");

exports.insert = function insert (collection, newDocument) {
    return BPromise.bind(this)
        .then(function () {
            ensure(
                new MW.Error(400, "First argument `newDocument` must be an object"),
                argMatches(t.Obj, newDocument)
            );
        })
        .then(function () {
            return collection
                .runValidationRules(this, "insert", null, newDocument);
        })
        .then(function () {
            newDocument._id = newDocument._id || randomId();
            return collection.dbCollection.insert(newDocument);
        })
        .then(R.always(null));
};

exports.update = function update (collection, documentId, patches) {
    return BPromise.bind(this)
        .then(function () {
            ensure(
                new MW.Error(400, "First argument `documentId` must be a string"),
                argMatches(t.Str, documentId)
            );
            ensure(
                new MW.Error(400, "Second argument `patches` must be an array of JSON patches"),
                argMatches(PatchesType, patches)
            );
        })
        .then(function () {
            return getOldDocument(collection, documentId);
        })
        .then(function (oldDocument) {
            var newDocument = applyPatches(oldDocument, patches);
            return collection
                .runValidationRules(this, "update", oldDocument, newDocument)
                .return(newDocument);
        })
        .then(function (newDocument) {
            return collection.dbCollection.update({
                _id: documentId
            }, {
                $set: R.omit(["_id"], newDocument)
            });
        })
        .then(R.always(null));
};

exports.remove = function update (collection, documentId) {
    return BPromise.bind(this)
        .then(function () {
            ensure(
                new MW.Error(400, "First argument `documentId` must be a string"),
                argMatches(t.Str, documentId)
            );
        })
        .then(function () {
            return getOldDocument(collection, documentId);
        })
        .then(function (oldDocument) {
            return collection
                .runValidationRules(this, "remove", oldDocument, null);
        })
        .then(function () {
            return collection.dbCollection.remove({
                _id: documentId
            });
        })
        .then(R.always(null));
};
