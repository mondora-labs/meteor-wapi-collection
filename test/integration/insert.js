var BPromise = require("bluebird");
var express  = require("express");
var MW       = require("meteor-wapi");
var should   = require("should");
var request  = require("supertest-as-promised");

var Collection = require("../../");
var st         = require("../st.js");

describe("Integration suite - Inserting a document", function () {

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
        return BPromise.promisify(elements.remove, elements)({});
    });

    it("400 on calling the api with the wrong arguments", function () {
        var Elements = new Collection(mw, "elements");
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/insert", params: ["myDocument"]})
            .expect("Content-Type", /json/)
            .expect(400)
            .expect({error: "First argument `newDocument` must be an object"});
    });

    it("error if validation rules fail [throwing]", function () {
        var Elements = new Collection(mw, "elements");
        Elements.addValidationRules({
            insert: function (newDocument) {
                throw new MW.Error(499, "Validation error");
            }
        });
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/insert", params: [{}]})
            .expect("Content-Type", /json/)
            .expect(499)
            .expect({error: "Validation error"});
    });

    it("error if validation rules fail [returning an eventually rejected promise]", function () {
        var Elements = new Collection(mw, "elements");
        Elements.addValidationRules({
            insert: function (newDocument) {
                return BPromise.reject(new MW.Error(489, "Another validation error"));
            }
        });
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/insert", params: [{}]})
            .expect("Content-Type", /json/)
            .expect(489)
            .expect({error: "Another validation error"});
    });

    it("inserting the document successful (after multiple validation rules pass)", function () {
        var Elements = new Collection(mw, "elements");
        Elements
            .addValidationRules({
                insert: function (newDocument) {
                    return null;
                }
            })
            .addValidationRules({
                insert: function (newDocument) {
                    return BPromise.resolve(null);
                }
            });
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/insert", params: [{}]})
            .expect("Content-Type", /json/)
            .expect(200)
            .expect({result: null})
            .then(function () {
                var cursor = Elements.mw.db.collection("elements").find({});
                return BPromise.promisify(cursor.count, cursor)();
            })
            .then(function (count) {
                count.should.equal(1);
            });
    });

    it("automatic assignment of a string _id", function () {
        var Elements = new Collection(mw, "elements");
        var app = express().use("/", mw.getRouter());
        return request(app)
            .post("/")
            .send({method: "/elements/insert", params: [{}]})
            .expect("Content-Type", /json/)
            .expect(200)
            .expect({result: null})
            .then(function () {
                var collection = Elements.mw.db.collection("elements");
                return BPromise.promisify(collection.findOne, collection)({});
            })
            .then(function (element) {
                element._id.should.be.a.String;
                element._id.length.should.equal(32);
            });
    });

});
