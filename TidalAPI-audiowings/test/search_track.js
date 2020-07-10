var TidalAPI = require('./client');


var api = new TidalAPI({
  username: 'audiowingsintro',
  password: 'tidalaudiowings',
  token: 'Gi8gmFlBln6ozH4t',
  clientVersion: '2.2.1--7',
  quality: 'LOSSLESS'
});



api.search({type: 'tracks', query: 'Jay-Z', limit: 3}, function(sdata){
  console.log(sdata.tracks);
})