var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("audiowings");
  var myobj = [
    {
        userId: '',
        providerId: '',
        userName: '',
        password: ''
      }

  ];
  dbo.collection("userProvider").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});