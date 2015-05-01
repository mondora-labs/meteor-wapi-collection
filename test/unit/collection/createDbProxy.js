var R      = require("ramda");
var should = require("should-promised");
var sinon  = require("sinon");

var Collection = require("collection");

describe("Unit suite - The createDbProxy method", function () {

    it("should create the dbCollection proxy as a property of to the collection instance", function () {
        var instance = {
            name: "elements",
            mw: {
                db: {
                    collection: R.always({
                        findOne: R.always(),
                        insert: R.always(),
                        update: R.always(),
                        remove: R.always()
                    })
                }
            }
        };
        Collection.prototype.createDbProxy.call(instance);
        instance.dbCollection.should.be.a.Object;
        instance.dbCollection.findOne.should.be.a.Function;
        instance.dbCollection.insert.should.be.a.Function;
        instance.dbCollection.update.should.be.a.Function;
        instance.dbCollection.remove.should.be.a.Function;
    });

});
