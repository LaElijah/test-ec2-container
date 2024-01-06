import { WebSocketServer } from 'ws';
import socketEventHandler from "./socketEventHandler.js";
import debouncedRemoveClient from "./debouncedRemoveClient.js";
import STORE_OPERATOR from '../global/store.js';
import parseQueryParams from '../tools/parseQueryParams.js';
const getStores = STORE_OPERATOR;
const handleStaleConnections = (socket) => {
    const { localStores: { clients } } = getStores();
    if (socket.isAlive === false) {
        debouncedRemoveClient(Array
            .from(clients.keys())
            .find(key => key.split('&')[1] === socket.id), socket);
        return socket.terminate();
    }
    socket.isAlive = false;
    socket.ping();
};
const wss = new WebSocketServer({ noServer: true });
wss.on("close", (event) => console.log("server close", event));
wss.on("error", (event) => console.log("error", event));
wss.on("connection", async (socket, req) => {
    const { localStores: { clients } } = getStores();
    const id = (parseQueryParams(req)).get("id") || "";
    socket.id = id;
    socket.timer = setInterval(() => {
        socket.ping();
    }, 30000);
    socket.onclose = (event) => console.log("onclose");
    socket.onerror = (event) => console.log("onerror", event);
    socket.onmessage = (msg) => socketEventHandler(msg, socket, id);
    socket.on("unexpected-response", (req, res) => {
        console.log("unexpected", req, res);
    });
    socket.on("upgrade", (req) => {
        console.log("upgrade", req);
    });
    socket.on("close", () => debouncedRemoveClient(Array
        .from(clients.keys())
        .find(key => key.split('&')[1] === id), socket));
    socket.on("ping", () => {
        console.log("PINGED CLIENT");
    });
    socket.on("pong", () => {
        console.log("PONG RECEIVED");
        socket.isAlive = true;
    });
});
const interval = setInterval(() => wss.clients.forEach((socket) => handleStaleConnections(socket)), 30000);
wss.on("close", () => clearInterval(interval));
export default wss;
