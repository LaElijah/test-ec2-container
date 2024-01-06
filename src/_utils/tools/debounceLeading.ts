export default function debounceLeading(func: { (clientKey: string, socket: { timer: string | number | NodeJS.Timeout | undefined; terminate: () => void; }): Promise<void>; apply?: any; }, timeout = 1000) {
    let timer: NodeJS.Timeout | undefined
    return (...args: any) => {
        if (!timer) {
         // switch func param to this if the function isnt working 
            func.apply(func, args);
        }
        
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
        }, timeout);
    };
}
