import { IncomingMessage } from "http"

type Client = {
    username: string
}

export default (req: IncomingMessage, next: (error?: Error, client?: Client) => void) => {

    next(undefined, {
        username: "h"
    })
}