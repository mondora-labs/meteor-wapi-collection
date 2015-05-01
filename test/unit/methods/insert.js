var BPromise = require("bluebird");
var MW       = require("meteor-wapi");
var R        = require("ramda");
var should   = require("should-promised");
var sinon    = require("sinon");

var methods = require("methods");

describe("Unit suite - The insert method", function () {

    it("should return a promise", function () {
        var promise = methods.insert();
        promise.catch(R.always(null));
        return promise.should.be.a.Promise;
    });

    it("should run validation insert rules", function () {
        var collection = {
            runValidationRules: sinon.spy()
        };
        return methods.insert(collection, {})
            .catch(R.always(null))
            .then(function () {
                collection.runValidationRules.called.should.equal(true);
                collection.runValidationRules.firstCall.args[1].should.equal("insert");
            });
    });

    it("should give the document a random _id if it doesn't have one", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            dbCollection: {
                insert: sinon.stub().returns(BPromise.resolve())
            }
        };
        return methods.insert(collection, {})
            .then(function () {
                var insertedDocument = collection.dbCollection.insert.firstCall.args[0];
                insertedDocument._id.should.be.a.String;
                insertedDocument._id.length.should.equal(32);
            });
    });

    it("should call dbCollection.insert with the new document", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            dbCollection: {
                insert: sinon.stub().returns(BPromise.resolve())
            }
        };
        return methods.insert(collection, {_id: "_id", a: 1})
            .then(function () {
                collection.dbCollection.insert.calledWith({
                    _id: "_id",
                    a: 1
                }).should.equal(true);
            });
    });

});

describe("Unit suite - The promise returned by the insert method", function () {

    it("should be rejected if the remote argument `newDocument` is not an object", function () {
        return methods.insert().should.be.rejectedWith(MW.Error, {
            code: 400,
            message: "First argument `newDocument` must be an object"
        });
    });

    it("should be rejected if running validation rules fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.reject(
                new MW.Error(499, "Error message")
            ))
        };
        return methods.insert(collection, {}).should.be.rejectedWith(MW.Error, {
            code: 499,
            message: "Error message"
        });
    });

    it("should be rejected if inserting fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            dbCollection: {
                insert: R.always(BPromise.reject(
                    new MW.Error(599, "Insert error")
                ))
            }
        };
        return methods.insert(collection, {}).should.be.rejectedWith(MW.Error, {
            code: 599,
            message: "Insert error"
        });
    });

    it("should be resolved with null if nothing fails", function () {
        var collection = {
            runValidationRules: R.always(BPromise.resolve()),
            dbCollection: {
                insert: R.always(BPromise.resolve())
            }
        };
        return methods.insert(collection, {})
            .then(function (result) {
                (result === null).should.equal(true);
            });
    });

});
