var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("audiowings");
  var myobj = [
    {
      'userId': '1',
      'displayname': 'Harry HiFi',
      'activeDevice': 'FF-01-25-79-C7-EC',
    },
    {
      'userId': '2',
      'displayname': 'Pamela Premium',
      'activeDevice': '40-34-F1-48-48-3F',
    },
    {
      'userId': '3',
      'displayname': 'Ian Inactive',
      'activeDevice': '80-62-E5-FB-9B-C5',
    }
  ];
  dbo.collection("users").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});