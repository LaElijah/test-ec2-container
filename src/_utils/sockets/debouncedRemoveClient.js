import getStores from "../globals/store.js";
import ws from "ws"


export function debounceLeading(func, timeout = 1000) {
    let timer;
    return (...args) => {
        if (!timer) {
            func.apply(this, args);
        }
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
        }, timeout);
    };
}


async function removeClient(clientKey, socket) {
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
