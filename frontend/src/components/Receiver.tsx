import { useEffect } from "react"

export const Receiver = () => {

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8000');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
    }, []);

    function startReceiving(socket: WebSocket) {


        const pc = new RTCPeerConnection();

        pc.ontrack = async (event) => {

            console.log("Track received", event);
            const video = document.createElement('video');
            document.body.appendChild(video);

            // Create a MediaStream from the event and attach it to the video element

            video.srcObject = new MediaStream([event.track]);
            video.play()

            // Ensure the video starts playing once it's ready

        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'createOffer') {
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        }
    }

    return <div>Receiver</div>;
}
