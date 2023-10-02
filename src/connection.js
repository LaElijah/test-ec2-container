import dotenv from 'dotenv';
dotenv.config();

// Replace localhost with your IP;
// 54.209.121.134
const ws = new WebSocket(`ws://${process.env.PUBLIC_HOST}`);
ws.onopen = function() {

    ws.send(JSON.stringify({
        type: "handshake",
        payload: { 
            username: "John",
            groupId: "join-1"
        }
    }));
};

ws.onmessage = function(evt) {
    console.log(JSON.parse(evt.data).payload);
};


async function publishMessage(message) {
    const response = await fetch(`http://${process.env.PUBLIC_HOST}/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            payload: {
                groupId: "join-1",
                message: "message",
                username: "test_8"
            }
        })
    });
    const data = await response.json();
    console.log(data);
}

const buttonElement = document.getElementById("btn");

buttonElement.addEventListener("click", async function() {
    await publishMessage();
});



console.log("Hello World");