import cluster from "cluster"
import messageType from "../types/messageType.js"
import notificationType from "../types/notificationType.js"

import consumer from "./consumer.js"

const getBufferType = (message: any): any => {
    // TODO: Update this to handle dynamic Type selection
    if (messageType.isValid(message)) return messageType
    else return notificationType

}
export default async (topics: (string | RegExp)[]) => {

    await consumer.connect()
    await consumer.subscribe({ topics: ['messaging-service', 'notification-service'] })


    await consumer.run({
        eachMessage: async ({ message, partition }: {
            message: any,
            partition: any
        }) => {
           
          for (const id in cluster.workers) {
                const worker = cluster.workers[id]
                if (worker) worker.send(
                    {
                        type: "message",
                        message:
                        {
                            event: (getBufferType(message)).fromBuffer(message.value),
                            partition,
                        }
                    })
            }

        }
    }
    )
}
