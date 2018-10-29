var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("audiowings");
  var myobj = [
    {
        providerName: 'Device',
        providerToken: null,
        providerClientVer: null
      },
      {
        providerName: 'Audiowings',
        providerToken: null,
        providerClientVer: null
      },
      {
        providerName: 'Tidal',
        providerBaseUrl: 'https://api.tidal.com/',
        providerToken: 'Gi8gmFlBln6ozH4t',
        providerClientVer: 'v1'
      },
      {
        providerName: 'Napster',
        providerBaseUrl: 'https://api.napster.com/',
        providerToken: '',
        providerClientVer: 'v2.2',
        providerApiKey: 'MGQ5N2Q5MzYtMzRlYy00NDdjLWIyYzYtMDAyOWFmM2E3Zjhj'
      }
  ];
  dbo.collection("providers").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});