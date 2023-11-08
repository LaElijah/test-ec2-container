import Queue from "./Queue";

export default class CallLimiter extends Queue {
    timeToClear = 1000

    constructor(limit = 1, timeToClear, startingArray) {
        super(limit, startingArray)
        this.timeToClear = timeToClear
    }

    call() {
        this.store[0]()
        setTimeout(() => {
            this.clear()
        }, this.timeToClear)
    }

    clear() {
        this.store = []
    }

    sequence() {
        this.store[0]()
        setTimeout(() => {
            this.store.shift()
        }, this.timeToClear)
    }
}