import STORE_OPERATOR from "../global/store.js";
import eventWriter from "./eventWriter.js";
const getStores = STORE_OPERATOR;
const eventHandler = (event) => {
    const { localStores: { subscribers } } = getStores();
    eventWriter(event, (data) => {
        // Can put extra data processing or validating logic here
        const processedData = data;
        const key = `${event.username}&${event.id}`;
        console.log("KEY", key);
        const res = subscribers.get(key);
        if (res)
            console.log("ITS HERE");
        console.log("GOING TO WRITE");
        if (res)
            return [res, processedData];
    });
};
export default eventHandler;
