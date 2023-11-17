import Store from "../tools/Store.js"
import ws from "ws"
const { clients } = Store // .getStores()

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


function removeClient(clientKey, socket) {
    if (clientKey && clients.get(clientKey)?.readyState !== ws.OPEN) clients.delete(clientKey)
    clearInterval(socket.timer);
    socket.terminate()
    console.log("Updated clients", clients.keys(), 40)
}


const debouncedRemoveClient = debounceLeading(removeClient, 5000)


export default debouncedRemoveClient
