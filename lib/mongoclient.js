var mongo = require('mongodb').MongoClient;

var myMongoclient = {};

myMongoclient.addRecord = function (url, dbname, collectionname, object, callback) {
    mongo.connect(url, function (err, db) {
        if (err) {
            callback('Error opening db');
        } else {
            console.log('DB opened');
            var dbo = db.db(dbname);
            dbo.collection(collectionname).insertOne(object, function (err, res) {
                if (err) {
                    callback('Error inserting object');
                } else {
                    callback(false);
                }
            });
            db.close();
            callback(false);
        }
    });
};

myMongoclient.findRecord = function (url, dbname, collectionname, query, callback) {
    mongo.connect(url, function (err, db) {
        if (err) {
            callback(err, 'Error opening db');
        } else {
            console.log('DB opened');
            var dbo = db.db(dbname);
            dbo.collection(collectionname).find(query).toArray(function (err, res) {
                if (err) {
                    callback(err, 'Error getting object');
                } else {
                    //console.log(res);
                    callback(false, res);
                }
            });
            db.close();//close the db
        }
    });
};



var token1 = {
    'id': 2,
    'value': 'token2'
};

var query = {
    'id': 2
};

/**
myMongoclient.addrecord('mongodb://127.0.0.1:27017/', 'tokendb', 'tokens', token1, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('DB closed');
    }
});
*/

myMongoclient.findRecord('mongodb://127.0.0.1:27017/', 'tokendb', 'tokens', query, function (err, data) {
    console.log('calling findRecord!');
    if (err) {
        console.log(err);
    } else {
        //console.log('hh');
        console.log(data);
    }
});

//module.exports = mongoclient;