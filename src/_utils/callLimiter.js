
export class Queue {
    store
    limit = 20


    constructor(limit, startingArray) {
        if (limit) this.limit = limit
        
        if (startingArray) {
            let workingArray = []
            let workingLimit = (this.limit || 20) -1
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