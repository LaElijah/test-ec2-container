export default function privateMessage(username, msg, clients) {
    const client = clients[username];
    if (client.readyState === ws.OPEN) {
        client.send(msg);
    }
}
