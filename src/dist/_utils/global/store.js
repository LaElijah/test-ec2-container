import RedisWorker from "../tools/RedisWorker.js";
let store = { redisWorkers: {}, localStores: {}, localSets: {} };
function getStores(stores) {
    if (stores) {
        const { redisWorkers, localStores, localSets } = stores;
        if (redisWorkers)
            Array.isArray(redisWorkers)
                ? store.redisWorkers = Object.fromEntries(redisWorkers.map(key => [key, new RedisWorker({ name: key })]))
                : store.redisWorkers[redisWorkers] = new RedisWorker({ name: redisWorkers });
        if (localStores)
            Array.isArray(localStores)
                ? store.localStores = Object.fromEntries(localStores.map(key => [key, new Map()]))
                : store.localStores[localStores] = new Map();
        if (localSets)
            Array.isArray(localSets)
                ? store.localSets = Object.fromEntries(localSets.map(key => [key, new Set()]))
                : store.localSets[localSets] = new Set();
    }
    return Object.assign({}, store);
}
export default getStores;
