const providers = {
    DEVICE: {
        id: 1,
        providerName: 'Device',
        providerToken: null,
        providerClientVer: null
    },
    AUDIOWINGS: {
        id: 2,
        providerName: 'Audiowings',
        providerToken: null,
        providerClientVer: null
    },
    TIDAL: {
        id: 3,
        providerName: 'Tidal',
        providerToken: 'Gi8gmFlBln6ozH4t',
        providerClientVer: '2.2.1--7'
    },
    SPOTIFY: {
        id: 4,
        providerName: 'Spotify',
        providerToken: null,
        providerClientVer: null
    }
};
Object.freeze(providers)

exports.providers = providers