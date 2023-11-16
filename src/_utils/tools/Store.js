


export default class Store {
  static instance
  static clients = new Map()
  static groups = new Map()


  static getStores() {
    if (!this.instance) {
        this.instance = new Store()
        return Store.instance
    }
    else {
        return Store.instance
    }
  }



}