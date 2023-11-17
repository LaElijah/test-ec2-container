


 class Store {
  static instance = null
  static clients = new Map()
  static groups = new Map()

  constructor() {}

  static getStores() {
    if (!Store.instance) {
      Store.instance = new Store()
    }
    return Store.instance
  }
}

// const store = new Store()

const data = (function(){
  this.groups = new Map()
  this.clients = new Map()
  return this
})()

export default data

