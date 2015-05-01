var BPromise = require("bluebird");
var MW       = require("meteor-wapi");
var R        = require("ramda");

var ensure = require("./ensure.js");

module.exports = function getOldDocument (collection, documentId) {
    return BPromise.resolve()
        .then(function () {
            return collection.dbCollection.findOne({
                _id: documentId
            });
        })
        .then(function (oldDocument) {
            ensure(
                new MW.Error(404, "Document not found"),
                !R.isNil(oldDocument)
            );
            return oldDocument;
        });
};
