
export class Queue {
    store
    limit = 20


    constructor(limit, startingArray) {
        if (limit) this.limit = limit

        if (startingArray) {
            let workingArray = []
            let workingLimit = (this.limit || 20) - 1
            let totalLimit = (startingArray.length < workingLimit) ? startingArray.length : workingLimit

            for (let i = 0; i <= totalLimit; i++) {
                let element = startingArray.reverse()[i]
                if (element) workingArray.push(element)
            }
            this.store = [...workingArray]
        } else this.store = []

    }

    add(element) {


        let limit = this.limit || 20

        if (this.store.length >= limit) {
            let workingStore = [...this.store]
            workingStore.shift()
            // this.store = [...workingStore, element]
            this.store.shift()
            this.store.push(element)
        }
        else {
            // this.store = [...this.store, element]
            this.store.push(element)
        }
    }


    get queue() {
        return [...this.store]
    }

}


export default class CallLimiter extends Queue {
    timeToClear = 1000
    calling = false

    constructor(limit = 1, timeToClear, startingArray) {
        super(limit, startingArray)
        this.timeToClear = timeToClear

    }

    call() {
        // method meant for calling one function once in a period
        console.log("gonna call")
        if (!this.calling && this.store.length === 1) {
            this.store[0]()
            console.log("i just called")
            this.calling = true
            this.clear()
            setTimeout(() => {
                
                this.calling = false
            }, this.timeToClear)
        }
    }

    clear() {
        this.store = []
    }

    sequence() {
        // TODO: Add feature that calls next function adter calling is false again
        // maybe i could do it with a counter to iterate and call up to that point
        // and maybe i could do an event listener to listen for ending of calls 
        // like an event listener that calls a method called say sequenceCaller
        // and it iterates and shifts through the call list up until the 
        // counter number is reached 
        if (!this.calling) {
            this.store[0]()
            setTimeout(() => {
                this.store.shift()
            }, this.timeToClear)
        }
    }
}