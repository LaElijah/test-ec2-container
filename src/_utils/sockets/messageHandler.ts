import ws from "ws"
import Group from '../models/group.js';
import getStores from "../global/store.js";



export default async function messageHandler(event: any) {
    const { 
        localStores: { clients }, 
        redisWorkers: { groups } 
    } = getStores()

    const group = await groups.sMembers(event.groupId)
    // NOOP's if server doesnt host any activity for this group
    if (group.length > 0) {

        const dbGroup = await Group.findById(event.groupId)

        group.forEach((client: string) => {
            if (
                client.split('&')[0] !== event.sender
                && clients.get(client)?.readyState === ws.OPEN
            ) {
                clients.get(client).send(JSON.stringify({
                    type: "message",
                    payload: event
                }))
            }
        })

        // Update user history here
        if (!(dbGroup.messages.find((message: { UUID: string; }) => message.UUID === event.UUID))) {
            dbGroup.messages.push({ ...event })
            await dbGroup.save()
        }

    }

}
