export default (unprocessedData, getResponse) => {
    //console.log("Writing event")
    const response = getResponse(unprocessedData);
    console.log("AFTER RESPONSE");
    console.log(response, "HERES A RESPONSE MAYBE");
    if (response) {
        const [res, data] = response;
        console.log("WRITING");
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        console.log("WRITTEN");
    }
};
