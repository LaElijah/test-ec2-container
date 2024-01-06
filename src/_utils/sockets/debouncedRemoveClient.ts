import getStores from "../global/store.js";
import ws from "ws"
import debounceLeading from "../tools/debounceLeading.js";




async function removeClient(clientKey: string, socket: { timer: string | number | NodeJS.Timeout | undefined; terminate: () => void; }) {
    const { localStores: { clients } } = getStores()
    if (clientKey && clients.get(clientKey)?.readyState !== ws.OPEN) {
        clients.delete(clientKey)        // await redisWorkers.clients.delete(clientKey)
        clearInterval(socket.timer);
        socket.terminate()
    }
    console.log("Remaining clients", clients.keys(), 25)
}


const debouncedRemoveClient = debounceLeading(removeClient, 5000)


export default debouncedRemoveClient
