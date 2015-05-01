var R      = require("ramda");
var should = require("should-promised");
var sinon  = require("sinon");

var Collection = require("collection");

describe("Unit suite - The Collection constructor", function () {

    before(function () {
        sinon.stub(Collection.prototype, "createDbProxy");
        sinon.stub(Collection.prototype, "attachMethods");
        sinon.stub(Collection.prototype, "initValidationRules");
    });

    after(function () {
        Collection.prototype.createDbProxy.restore();
        Collection.prototype.attachMethods.restore();
        Collection.prototype.initValidationRules.restore();
    });

    it("should save the mw instance, the name, and init the collection instance", function () {
        var mw = {};
        var Elements = new Collection(mw, "elements");
        Elements.mw.should.equal(mw);
        Elements.name.should.equal("elements");
        Collection.prototype.createDbProxy.called.should.equal(true);
        Collection.prototype.createDbProxy.calledOn(Elements).should.equal(true);
        Collection.prototype.attachMethods.called.should.equal(true);
        Collection.prototype.attachMethods.calledOn(Elements).should.equal(true);
        Collection.prototype.initValidationRules.called.should.equal(true);
        Collection.prototype.initValidationRules.calledOn(Elements).should.equal(true);
    });

});
