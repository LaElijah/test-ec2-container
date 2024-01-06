const parseQueryParams = (req) => {
    if (req.url)
        return new URL(req.url, `http://${req.headers.host}`).searchParams;
    else
        throw new Error("HELP");
};
export default parseQueryParams;
