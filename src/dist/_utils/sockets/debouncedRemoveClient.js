import getStores from "../global/store.js";
import ws from "ws";
import debounceLeading from "../tools/debounceLeading.js";
async function removeClient(clientKey, socket) {
    var _a;
    const { localStores: { clients } } = getStores();
    if (clientKey && ((_a = clients.get(clientKey)) === null || _a === void 0 ? void 0 : _a.readyState) !== ws.OPEN) {
        clients.delete(clientKey); // await redisWorkers.clients.delete(clientKey)
        clearInterval(socket.timer);
        socket.terminate();
    }
    console.log("Remaining clients", clients.keys(), 25);
}
const debouncedRemoveClient = debounceLeading(removeClient, 5000);
export default debouncedRemoveClient;
