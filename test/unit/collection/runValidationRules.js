var BPromise = require("bluebird");
var R        = require("ramda");
var should   = require("should-promised");
var sinon    = require("sinon");

var Collection = require("collection");

describe("The runValidationRules method", function () {

    it("should return a promise", function () {
        var instance = {
            validationRules: {
                insert: []
            }
        };
        return Collection.prototype.runValidationRules
            .call(instance, {}, "insert", {}, {})
            .should.be.a.Promise;
    });

    it("should run all validation rules for the specified method", function () {
        var rule_0 = sinon.stub().returns(BPromise.resolve());
        var rule_1 = sinon.stub().returns(BPromise.resolve());
        var rule_2 = sinon.stub().returns(BPromise.resolve());
        var instance = {
            validationRules: {
                insert: [rule_0, rule_1, rule_2]
            }
        };
        return Collection.prototype.runValidationRules
            .call(instance, {}, "insert", {}, {})
            .then(function () {
                rule_0.called.should.equal(true);
                rule_1.called.should.equal(true);
                rule_2.called.should.equal(true);
            });
    });

    it("should call rules with the correct context and arguments", function () {
        var insertRule = sinon.stub().returns(BPromise.resolve());
        var updateRule = sinon.stub().returns(BPromise.resolve());
        var removeRule = sinon.stub().returns(BPromise.resolve());
        var instance = {
            validationRules: {
                insert: [insertRule],
                update: [updateRule],
                remove: [removeRule]
            }
        };
        var context = {context: true};
        var oldDocument = {oldDocument: true};
        var newDocument = {newDocument: true};
        var insertResult = Collection.prototype.runValidationRules
            .call(instance, context, "insert", null, newDocument)
            .then(function () {
                insertRule.calledOn(context).should.equal(true);
                insertRule.firstCall.args.length.should.equal(1);
                insertRule.firstCall.args[0].should.eql(newDocument);
            });
        var updateResult = Collection.prototype.runValidationRules
            .call(instance, context, "update", oldDocument, newDocument)
            .then(function () {
                updateRule.calledOn(context).should.equal(true);
                updateRule.firstCall.args.length.should.equal(2);
                updateRule.firstCall.args[0].should.eql(oldDocument);
                updateRule.firstCall.args[1].should.eql(newDocument);
            });
        var removeResult = Collection.prototype.runValidationRules
            .call(instance, context, "remove", oldDocument)
            .then(function () {
                removeRule.calledOn(context).should.equal(true);
                removeRule.firstCall.args.length.should.equal(1);
                removeRule.firstCall.args[0].should.eql(oldDocument);
            });
        return BPromise.all([
            insertResult,
            updateResult,
            removeResult
        ]);
    });

});

describe("The promise returned by the runValidationRules method", function () {

    it("should be fulfilled if all validation rules return either a value or an eventually fulfilled promise", function () {
        var rule_0 = sinon.stub().returns(true);
        var rule_1 = sinon.stub().returns(false);
        var rule_2 = sinon.stub().returns(BPromise.resolve());
        var instance = {
            validationRules: {
                insert: [rule_0, rule_1, rule_2]
            }
        };
        return Collection.prototype.runValidationRules
            .call(instance, {}, "insert", null, {}).should.be.fulfilled;
    });

    it("should be rejected if any of the validation rules either throws or returns an eventually rejected promise", function () {
        var goodRule = sinon.stub().returns(true);
        var badRule = sinon.stub().throws(new Error());
        var eventuallyBadRule = sinon.stub().returns(BPromise.reject());
        var instance_0 = {
            validationRules: {
                insert: [goodRule, badRule]
            }
        };
        var rejection_0 = Collection.prototype.runValidationRules
            .call(instance_0, {}, "insert", null, {}).should.be.rejected;
        var instance_1 = {
            validationRules: {
                insert: [goodRule, eventuallyBadRule]
            }
        };
        var rejection_1 = Collection.prototype.runValidationRules
            .call(instance_1, {}, "insert", null, {}).should.be.rejected;
        return BPromise.all([rejection_0, rejection_1]);
    });

});
