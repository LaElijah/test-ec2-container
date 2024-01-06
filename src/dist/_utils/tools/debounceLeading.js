export default function debounceLeading(func, timeout = 1000) {
    let timer;
    return (...args) => {
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
