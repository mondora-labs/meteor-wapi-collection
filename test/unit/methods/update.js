var BPromise = require("bluebird");
var jp       = require("fast-json-patch");
var MW       = require("meteor-wapi");
var R        = require("ramda");
var should   = require("should-promised");
var sinon    = require("sinon");

var methods = require("methods");

describe("The update method", function () {

    it("should return a promise", function () {
        var promise = methods.update();
        promise.catch(R.always(null));
        return promise.should.be.a.Promise;
    });

    it("should run validation update rules", function () {
        var collection = {
            runValidationRules: sinon.spy(),
            db: {
                findOne: R.always(BPromise.resolve({}))
            }
        };
        return methods.update(collection, "", [])
            .catch(R.always(null))
            .then(function () {
                collection.runValidationRules.called.should.equal(true);
                collection.runValidationRules.firstCall.args[1].should.equal("update");
            });
    });

    it("should call db.update with the updated document", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            db: {
                findOne: R.always(BPromise.resolve({_id: "_id"})),
                update: sinon.stub().returns(BPromise.resolve())
            }
        };
        var patches = jp.compare({}, {a: 1});
        return methods.update(collection, "_id", patches)
            .then(function () {
                collection.db.update.called.should.equal(true);
                collection.db.update.firstCall.args[0].should.eql({
                    _id: "_id"
                });
                collection.db.update.firstCall.args[1].should.eql({
                    $set: {
                        a: 1
                    }
                });
            });
    });

});

describe("The promise returned by the update method", function () {

    it("should be rejected if the remote argument `documentId` is not a string", function () {
        return methods.update().should.be.rejectedWith(MW.Error, {
            code: 400,
            message: "First argument `documentId` must be a string"
        });
    });

    it("should be rejected if the remote argument `patches` is not an array of patches", function () {
        return methods.update(null, "").should.be.rejectedWith(MW.Error, {
            code: 400,
            message: "Second argument `patches` must be an array of JSON patches"
        });
    });

    it("should be rejected if no document with the given id is found", function () {
        var collection = {
            db: {
                findOne: R.always(null)
            }
        };
        return methods.update(collection, "", []).should.be.rejectedWith(MW.Error, {
            code: 404,
            message: "Document not found"
        });
    });

    it("should be rejected if running validation rules fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.reject(
                new MW.Error(499, "Error message")
            )),
            db: {
                findOne: R.always({})
            }
        };
        return methods.update(collection, "", []).should.be.rejectedWith(MW.Error, {
            code: 499,
            message: "Error message"
        });
    });

    it("should be rejected if updating fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            db: {
                findOne: R.always({}),
                update: R.always(BPromise.reject(
                    new MW.Error(599, "Update error")
                ))
            }
        };
        return methods.update(collection, "", []).should.be.rejectedWith(MW.Error, {
            code: 599,
            message: "Update error"
        });
    });

    it("should be resolved with null if nothing fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            db: {
                findOne: R.always({}),
                update: R.always(BPromise.resolve())
            }
        };
        return methods.update(collection, "", [])
            .then(function (result) {
                (result === null).should.equal(true);
            });
    });

});
