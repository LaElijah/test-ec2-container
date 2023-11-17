


export default class Store {
  static instance
  static clients = new Map()
  static groups = new Map()


  static getStores() {
    if (!Store.instance) {
      Store.instance = new Store()
    }
    console.log("Well", Store.instance)
    return Store.instance
  }
}

