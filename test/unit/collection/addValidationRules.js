var should = require("should");
var sinon  = require("sinon");

var Collection = require("collection");

describe("Unit suite - The addValidationRules method", function () {

    it("should add validation rules to the collection instance", function () {
        var instance = {
            validationRules: {
                insert: [],
                update: [],
                remove: []
            }
        };
        var insert = sinon.spy();
        var update = sinon.spy();
        var remove = sinon.spy();
        Collection.prototype.addValidationRules.call(instance, {
            insert: insert,
            update: update,
            remove: remove
        });
        instance.validationRules.insert[0].should.equal(insert);
        instance.validationRules.update[0].should.equal(update);
        instance.validationRules.remove[0].should.equal(remove);
    });

    it("should return the collection instance to allow method chaining", function () {
        var instance = {
            validationRules: {
                insert: [],
                update: [],
                remove: []
            }
        };
        var insert = sinon.spy();
        var update = sinon.spy();
        var remove = sinon.spy();
        var ret = Collection.prototype.addValidationRules.call(instance, {});
        ret.should.equal(instance);
    });

});
