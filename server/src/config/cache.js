import NodeCache from 'node-cache';

// stdTTL = default TTL in seconds, checkperiod = cleanup interval
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export default cache;
