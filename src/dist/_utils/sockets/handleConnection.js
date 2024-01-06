import ws from "ws";
import getStores from "../global/store.js";
export default async function handleHandshake({ socket, id, sender, groupId }) {
    const { redisWorkers: { groups }, localStores: { clients } } = getStores();
    // socket.isClosed = false
    if (groupId !== "none") {
        const key = `${sender}&${id}`;
        // Map user to its websocket and store globally
        clients.set(key, socket);
        console.log(clients.keys());
        // Add user to set unique by ip address and username 
        // get members after group update
        await groups.sAdd(groupId, key);
        const group = await groups.sMembers(groupId);
        // const group = ["h"]
        // send to clients other than the entering user of new member totals
        // add a notification function here for if the client ready state is closed so make it an else statement
        group.forEach((client) => {
            const socket = clients.get(client);
            if ((socket === null || socket === void 0 ? void 0 : socket.readyState) === ws.OPEN) {
                socket.send(JSON.stringify({
                    type: "members",
                    members: group
                }));
            }
        });
    }
}