import { createClient } from "redis";
const clientSettings = {
    url: "redis://redis:6379"
};
function resolveTypeConversion(value) {
    let resolvedType;
    switch (true) {
        case typeof value === "string":
            resolvedType = value;
            break;
        case Array.isArray(value):
            resolvedType = value;
            break;
        default:
            resolvedType = JSON.stringify(value);
            break;
    }
    return resolvedType;
}
const resolveKey = (key, name) => `pid-${process.pid}~${name}:${key}`;
class RedisWorker {
    constructor({ name }) {
        this.name = "";
        this.handleRequest = async ({ key, value, command, attemptingType, ex }) => {
            try {
                const typeKey = `${this.name}~${key}~type`;
                const type = this.type || await RedisWorker.client.get(typeKey);
                const args = [key && resolveKey(key, this.name), value && resolveTypeConversion(value)];
                if (!type) {
                    // TODO: Restructure to use response from command to designate the type setting and 
                    // return statement only after succesful command
                    const response = await RedisWorker.client[command](...args);
                    if (ex)
                        await RedisWorker.client.expire();
                    await RedisWorker.client.set(typeKey, attemptingType);
                    this.type = attemptingType;
                    return response;
                }
                if (type === attemptingType) {
                    this.type = type;
                    const response = await RedisWorker.client[command](...args);
                    if (ex)
                        await RedisWorker.client.expire(args[0]);
                    return response;
                }
                else
                    console.error(`This key is storing the "${type}" data type \nType received: "${attemptingType}"`);
            }
            catch (err) {
                console.log(err);
            }
        };
        if (!RedisWorker.client.isOpen) {
            RedisWorker.client.connect();
        }
        if (name)
            this.name = name;
    }
    async set(key, value, ex) {
        await this.handleRequest({
            attemptingType: "string",
            command: "set",
            key,
            value,
            ex
        });
        // RedisWorker.client["set"](...[key && resolveKey(key, this.name) , value && resolveTypeConversion(value)])
    }
    async get(key) {
        return await this.handleRequest({
            attemptingType: "string",
            command: "get",
            key,
        });
        // return RedisWorker.client["get"](resolveKey(key, this.name))
    }
    async hSet(key, value, ex) {
        if (typeof value === "object")
            return await this.handleRequest({
                attemptingType: "object",
                command: "hSet",
                key,
                value,
                ex
            });
        else
            throw new Error("Value must be an Object");
    }
    async hGet(key, fields) {
        if (typeof fields === "string" || Array.isArray(fields))
            return await this.handleRequest({
                attemptingType: "object",
                command: "hGet",
                key,
                value: fields
            });
        else
            throw new Error(`Didn't get expected fields, got typeof: ${typeof fields}`);
    }
    async hGetAll(key) {
        const data = await this.handleRequest({
            attemptingType: "object",
            command: "hGetAll",
            key,
        });
        return Object.setPrototypeOf((data), Object.prototype);
    }
    async sAdd(key, value, ex) {
        await this.handleRequest({
            attemptingType: "set",
            command: "sAdd",
            key,
            value,
            ex
        });
    }
    async sMembers(key) {
        return await this.handleRequest({
            attemptingType: "set",
            command: "sMembers",
            key,
        });
    }
    async connect() {
        if (!RedisWorker.client.isOpen)
            await RedisWorker.client.connect();
    }
}
RedisWorker.client = createClient(clientSettings);
export default RedisWorker;
