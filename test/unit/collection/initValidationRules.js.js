var R      = require("ramda");
var should = require("should-promised");
var sinon  = require("sinon");

var Collection = require("collection");

describe("Unit suite - The initValidationRules method", function () {

    it("should create the validationRules store as a property of to the collection instance", function () {
        var instance = {};
        Collection.prototype.initValidationRules.call(instance);
        instance.validationRules.should.eql({
            insert: [],
            update: [],
            remove: []
        });
    });

});
