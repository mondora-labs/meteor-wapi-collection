var BPromise = require("bluebird");
var jp       = require("fast-json-patch");
var MW       = require("meteor-wapi");
var R        = require("ramda");
var should   = require("should-promised");
var sinon    = require("sinon");

var methods = require("methods");

describe("The remove method", function () {

    it("should return a promise", function () {
        var promise = methods.remove();
        promise.catch(R.always(null));
        return promise.should.be.a.Promise;
    });

    it("should run validation remove rules", function () {
        var collection = {
            runValidationRules: sinon.spy(),
            db: {
                findOne: R.always(BPromise.resolve({}))
            }
        };
        return methods.remove(collection, "")
            .catch(R.always(null))
            .then(function () {
                collection.runValidationRules.called.should.equal(true);
                collection.runValidationRules.firstCall.args[1].should.equal("remove");
            });
    });

    it("should call db.remove to remove the old document", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            db: {
                findOne: R.always(BPromise.resolve({_id: "_id"})),
                remove: sinon.stub().returns(BPromise.resolve())
            }
        };
        return methods.remove(collection, "_id")
            .then(function () {
                collection.db.remove.calledWith({
                    _id: "_id"
                }).should.equal(true);
            });
    });

});

describe("The promise returned by the remove method", function () {

    it("should be rejected if the remote argument `documentId` is not a string", function () {
        return methods.remove().should.be.rejectedWith(MW.Error, {
            code: 400,
            message: "First argument `documentId` must be a string"
        });
    });

    it("should be rejected if no document with the given id is found", function () {
        var collection = {
            db: {
                findOne: R.always(null)
            }
        };
        return methods.remove(collection, "").should.be.rejectedWith(MW.Error, {
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
        return methods.remove(collection, "").should.be.rejectedWith(MW.Error, {
            code: 499,
            message: "Error message"
        });
    });

    it("should be rejected if removing fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            db: {
                findOne: R.always({}),
                remove: R.always(BPromise.reject(
                    new MW.Error(599, "Remove error")
                ))
            }
        };
        return methods.remove(collection, "").should.be.rejectedWith(MW.Error, {
            code: 599,
            message: "Remove error"
        });
    });

    it("should be resolved with null if nothing fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            db: {
                findOne: R.always({}),
                remove: R.always(BPromise.resolve())
            }
        };
        return methods.remove(collection, "")
            .then(function (result) {
                (result === null).should.equal(true);
            });
    });

});
