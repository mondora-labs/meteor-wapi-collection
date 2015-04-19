var R      = require("ramda");
var should = require("should-promised");
var sinon  = require("sinon");

var Collection = require("collection");

describe("The attachMethods method", function () {

    it("should attach methods to the collection's mw instance", function () {
        var instance = {
            name: "elements",
            mw: {
                methods: sinon.spy()
            }
        };
        Collection.prototype.attachMethods.call(instance);
        var methods = instance.mw.methods.firstCall.args[0];
        R.keys(methods).should.eql([
            "/elements/insert",
            "/elements/update",
            "/elements/remove"
        ]);
    });

});
