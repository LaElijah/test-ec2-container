


export default class Store {
  static instance
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

// export default store

