
let TidalAPI = require('../client');


const urlUsagemode = "OFFLINE";
const assetPresentation = "FULL";
const aq = ["HIGH_RES", "LOSSLESS", "HIGH", "LOW"];
const outputResult = (i, result) => console.log('\n' + i + '\n', result) ;


let api = new TidalAPI({
  username: 'audiowingshifi',
  password: 'tidalaudiowings',
  token: 'Gi8gmFlBln6ozH4t',
  clientVersion: '2.2.1--7',
});

for (i = 0; i < aq.length; i++) {
  const quality = aq[i];
  api.getTrackURL(59727857, urlUsagemode, assetPresentation, quality, (result) => outputResult(quality, result) );
}

