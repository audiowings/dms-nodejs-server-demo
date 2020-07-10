let TidalAPI = require('../client');

const urlUsagemode = "STREAM";
const assetPresentation = "FULL";
const outputResult = (result) => console.log(result) ;


let api = new TidalAPI({
  username: 'audiowingshifi',
  password: 'tidalaudiowings',
  token: 'Gi8gmFlBln6ozH4t',
  clientVersion: '2.2.1--7',
});

api.getTrackURL(59727857, urlUsagemode, assetPresentation, "HIGH_RES", outputResult);

api.getTrackURL(59727857, urlUsagemode, assetPresentation, "LOSSLESS", outputResult);

api.getTrackURL(59727857, urlUsagemode, assetPresentation, "HIGH", outputResult);

api.getTrackURL(59727857, urlUsagemode, assetPresentation, "LOW", outputResult);