export default function privateMessage(id, msg, clients) {
    const client = clients[id]
    if (client.readyState === ws.OPEN) {
        client.send(msg)
    }

}
