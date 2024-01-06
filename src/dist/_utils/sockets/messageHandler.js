import ws from "ws";
import Group from '../models/group.js';
import getStores from "../global/store.js";
export default async function messageHandler(event) {
    const { localStores: { clients }, redisWorkers: { groups } } = getStores();
    const group = await groups.sMembers(event.groupId);
    // NOOP's if server doesnt host any activity for this group
    if (group.length > 0) {
        const dbGroup = await Group.findById(event.groupId);
        group.forEach((client) => {
            var _a;
            if (client.split('&')[0] !== event.sender
                && ((_a = clients.get(client)) === null || _a === void 0 ? void 0 : _a.readyState) === ws.OPEN) {
                clients.get(client).send(JSON.stringify({
                    type: "message",
                    payload: event
                }));
            }
        });
        // Update user history here
        if (!(dbGroup.messages.find((message) => message.UUID === event.UUID))) {
            dbGroup.messages.push(Object.assign({}, event));
            await dbGroup.save();
        }
    }
}
