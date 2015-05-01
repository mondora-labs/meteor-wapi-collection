var BPromise = require("bluebird");
var Client   = require("mongodb").MongoClient;
var MW       = require("meteor-wapi");

exports.setup = function () {
    return BPromise.resolve()
        .then(function connect () {
            return BPromise.promisify(Client.connect, Client)("mongodb://localhost:27017/mw-tests");
        })
        .then(function instantiate (db) {
            return new MW(db);
        });
};

exports.teardown = function (mw) {
    return BPromise.resolve()
        .then(function close () {
            return BPromise.promisify(mw.db.close, mw.db)();
        });
};
