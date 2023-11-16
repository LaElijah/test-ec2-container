import Store from "../tools/stores.js"
import Group from '../models/group.js';
import messageType from "../types/messageType.js"


const {clients, groups} = Store.getStores()


export default async function consumerHandler({ topic, partition, message }) {


    const event = messageType.fromBuffer(message.value)


    switch (event.type) {

        case "message":
            // const hostUser = await User.find({ username: event.sender })
            // const receiverUser = await User.find({ username: event.receiver })
            const dbGroup = await Group.findById(event.groupId)

            // if client is found i can do this by splitting of the username and checking if its a key within the clients object
            const clientNames = Array.from(clients.keys()).map(key => key.split('&')[0])

            console.log("Prepared client names", clientNames, 79)

            if (groups.get(event.groupId)) {
                Array.from(groups.get(event.groupId)).forEach(async (client) => {

                    if (client.split('&')[0] !== event.sender
                        && clients.get(client)?.readyState === ws.OPEN
                    ) {

                        clients.get(client).send(JSON.stringify({
                            type: "message",
                            payload: event
                        }))
                    }
                })
            }

            // Update user history here
            dbGroup.messages.push({ ...event })
            await dbGroup.save()
    }

}


// To let the user know their message was a suuccess, might be better off sending a notification eevnt 
// clients[event.username].send(JSON.stringify({
//     type: 'status',
//     payload: {
//         status: 'success'
//     }
// }))
