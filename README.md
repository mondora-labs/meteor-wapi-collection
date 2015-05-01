[![Build Status](https://travis-ci.org/mondora-labs/meteor-wapi-collection.svg?branch=master)](https://travis-ci.org/mondora-labs/meteor-wapi-collection)
[![Coverage Status](https://img.shields.io/coveralls/mondora-labs/meteor-wapi-collection.svg)](https://coveralls.io/r/mondora-labs/meteor-wapi-collection?branch=master)
[![Dependency Status](https://david-dm.org/mondora-labs/meteor-wapi-collection.svg)](https://david-dm.org/mondora-labs/meteor-wapi-collection)
[![devDependency Status](https://david-dm.org/mondora-labs/meteor-wapi-collection/dev-status.svg)](https://david-dm.org/mondora-labs/meteor-wapi-collection#info=devDependencies)

# meteor-wapi-collection

Easy CUD (no R) collections for meteor-wapi

## Install

`npm i --save meteor-wapi-collection`

## Example

```js
var express     = require("express");
var MongoClient = require("mongodb").MongoClient;
var MW          = require("meteor-wapi");
var Collection  = require("meteor-wapi-collection");

var mongoUrl = process.env.MONGO_URL || "mongodb://localhost:3001/meteor";

MongoClient.connect(mongoUrl, function (err, db) {
    var mw = new MW(db);
    var Books = new Collection(mw, "books");
    /*
    *   We now have three remote methods defined:
    *     - `/books/insert`
    *     - `/books/update`
    *     - `/books/remove`
    */
    var app = express()
        .use("/call", mw.getRouter())
        .listen(process.env.PORT || 4000);
});
```

## API

### new Collection(mw, name)

Creates a new Collection instance and attaches three remote methods to the
supplied MW instance. The three methods are:

* `/collectionName/insert`
* `/collectionName/update`
* `/collectionName/remove`

##### Arguments

* `mw` **MW instance** _required_: the MW instance we wish to use with the
  collection.

* `name` **String** _required_: the name of the collection.

##### Returns

A Collection instance.

### .addValidationRules(rulesMap)

Registers validation rules for the `insert`, `update` and `remove` methods.

Validation rules can either:

* throw or return a value (which is ignored)
* return a promise which either gets fulfilled (with a value which is
  ignored) or rejected

If the rule returns a value (even undefined) or an eventually fulfilled
promise, the value (fulfillment-value) is ignored and the operation
continues (after subsequent rules are run).

If a rule throws, or returns a promise which gets rejected, the operation is
aborted (subsequent rules won't run). If the error thrown (or passed as
rejection value of the promise) is an instance of a MW.Error, then it'll get
sent back to the client. Otherwise, a generic "500 Internal server error"
error will be sent.

Validation rules have access to the same context of their associated method.

##### Arguments

* `rulesMap` **string-function dictionary** _required_: a dictionary of
  validation functions, where the keys can either be `insert`, `update` or
  `remove`

<span style="color:red;">TODO:</span> consider giving the possibility to extend
the context in which the validation rules run (as `meteor-wapi` does for
methods).

##### Returns

The Collection instance to allow for method chaining.

## Attached remote methods

### /collectionName/insert (newDocument)

Inserts a document.

#### Arguments

* `newDocument` **Object** _required_: the document to insert.

#### Returns

* `200 OK` if successful, `4**` or `5**` otherwise.

### /collectionName/update (documentId, patches)

Updates a document.

#### Arguments

* `documentId` **String** _required_: the `_id` of the document to update.

* `patches` **Array of JSON-Patches** _required_: the array of JSON patches to
  apply to the document. JSON-Patches must conform to the
  [rfc 6902](http://tools.ietf.org/html/rfc6902) standard.

#### Returns

* `200 OK` if successful, `4**` or `5**` otherwise.

### /collectionName/remove (documentId)

Removes a document.

#### Arguments

* `documentId` **String** _required_: the `_id` of the document to remove.

#### Returns

* `200 OK` if successful, `4**` or `5**` otherwise.
