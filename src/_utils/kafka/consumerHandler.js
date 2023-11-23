import ws from "ws"
import Group from '../models/group.js';
import messageType from "../types/messageType.js"
import getStores from "../globals/store.js";



export default async function consumerHandler({message: event, partition}) { // { topic, partition }
    console.log(process.pid, "CONSUME", partition)
    const { localStores: { clients }, redisWorkers: { groups } } = getStores()

    switch (event.type) {

        case "message":
            const group = await groups.sMembers(event.groupId)
            // NOOP's if server doesnt host any activity for this group

            if (group) {
                const dbGroup = await Group.findById(event.groupId)

                // Clients in the group this server is handling
                // const clientNames = group.map(key => key.split('&')[0])

                group.forEach((client) => {
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
                
                if (!dbGroup.messages.find(message => message.UUID === event.UUID)) {
                    console.log("SAVING MESSAGE")
                    dbGroup.messages.push({ ...event })
                    await dbGroup.save()
                }

            }
    }
}



