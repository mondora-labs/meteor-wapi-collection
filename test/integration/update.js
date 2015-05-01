var BPromise = require("bluebird");
var express  = require("express");
var MW       = require("meteor-wapi");
var should   = require("should");
var request  = require("supertest-as-promised");

var Collection = require("../../");
var st         = require("../st.js");

describe("Integration suite - Updating a document", function () {

    var patches = [{
        op: "add",
        path: "/prop",
        value: "value"
    }];

    var mw;
    before(function () {
        return st.setup().then(function (mwInstance) {
            mw = mwInstance;
        });
    });
    after(function () {
        return st.teardown(mw);
    });

    beforeEach(function () {
        var elements = mw.db.collection("elements");
        return BPromise.resolve()
            .then(function () {
                return BPromise.promisify(elements.remove, elements)({});
            })
            .then(function () {
                return BPromise.promisify(elements.insert, elements)({
                    _id: "elementId"
                });
            });
    });

    it("400 on calling the api with the wrong arguments [first argument]", function () {
        var Elements = new Collection(mw, "elements");
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/update", params: [{}, "previous-arg-not-a-string"]})
            .expect("Content-Type", /json/)
            .expect(400)
            .expect({error: "First argument `documentId` must be a string"});
    });

    it("400 on calling the api with the wrong arguments [second argument]", function () {
        var Elements = new Collection(mw, "elements");
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/update", params: ["second-arg-not-array-of-patches", {}]})
            .expect("Content-Type", /json/)
            .expect(400)
            .expect({error: "Second argument `patches` must be an array of JSON patches"});
    });

    it("404 on document not found", function () {
        var Elements = new Collection(mw, "elements");
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/update", params: ["idNotInDatabase", patches]})
            .expect("Content-Type", /json/)
            .expect(404)
            .expect({error: "Document not found"});
    });

    it("error if validation rules fail [throwing]", function () {
        var Elements = new Collection(mw, "elements");
        Elements.addValidationRules({
            update: function (newDocument) {
                throw new MW.Error(499, "Validation error");
            }
        });
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/update", params: ["elementId", patches]})
            .expect("Content-Type", /json/)
            .expect(499)
            .expect({error: "Validation error"});
    });

    it("error if validation rules fail [returning an eventually rejected promise]", function () {
        var Elements = new Collection(mw, "elements");
        Elements.addValidationRules({
            update: function (newDocument) {
                return BPromise.reject(new MW.Error(489, "Another validation error"));
            }
        });
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/update", params: ["elementId", patches]})
            .expect("Content-Type", /json/)
            .expect(489)
            .expect({error: "Another validation error"});
    });

    it("updating the document successful (after multiple validation rules pass)", function () {
        var Elements = new Collection(mw, "elements");
        Elements
            .addValidationRules({
                update: function (newDocument) {
                    return null;
                }
            })
            .addValidationRules({
                update: function (newDocument) {
                    return BPromise.resolve(null);
                }
            });
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/update", params: ["elementId", patches]})
            .expect("Content-Type", /json/)
            .expect(200)
            .expect({result: null})
            .then(function () {
                var collection = Elements.mw.db.collection("elements");
                return BPromise.promisify(collection.findOne, collection)({
                    _id: "elementId"
                });
            })
            .then(function (element) {
                element.should.eql({
                    _id: "elementId",
                    prop: "value"
                });
            });
    });

});
