let pc = null;
let dc = null;
let conversationHistory = []; // Store all messages

async function startConnection() {
    try {
        // Get ephemeral key from backend
        const tokenResponse = await fetch("http://localhost:3000/session");
        const data = await tokenResponse.json();
        const EPHEMERAL_KEY = data.client_secret.value;

        // Initialize WebRTC connection
        pc = new RTCPeerConnection();

        // Setup audio playback
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
        pc.ontrack = e => audioEl.srcObject = e.streams[0];

        // Capture microphone input
        const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
        pc.addTrack(ms.getTracks()[0]);

        // Setup WebRTC data channel
        dc = pc.createDataChannel("oai-events");

        // Log when data channel opens
        dc.addEventListener("open", () => console.log("Data channel is open!"));

        // Listen for incoming messages (Assistant's response)
        dc.addEventListener("message", e => {
            console.log("Raw event received:", e.data); // Debug log

            try {
                const realtimeEvent = JSON.parse(e.data);
                console.log("Parsed Event:", realtimeEvent); // Debug log

                if (realtimeEvent.response && realtimeEvent.response.output) {
                    const output = realtimeEvent.response.output;

                    // Find the transcript from the response
                    const textResponse = output
                        .flatMap(item => item.content)
                        .find(content => content.type === "audio")?.transcript;

                    if (textResponse) {
                        conversationHistory.push({ role: "assistant", text: textResponse });
                        updateConversationUI();
                    } else {
                        console.log("No transcript found in response.");
                    }
                } else {
                    console.log("No valid response output.");
                }
            } catch (error) {
                console.error("Error parsing event:", error);
            }
        });

        // Create an offer and set local SDP
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to OpenAI's Realtime API
        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
                Authorization: `Bearer ${EPHEMERAL_KEY}`,
                "Content-Type": "application/sdp"
            },
        });

        // Set remote SDP (answer)
        const answer = { type: "answer", sdp: await sdpResponse.text() };
        await pc.setRemoteDescription(answer);

        console.log("Session started.");
        conversationHistory.push({ role: "system", text: "Session started..." });
        updateConversationUI();

        // Start automatic voice capture
        captureUserSpeech();
    } catch (error) {
        console.error("Error setting up WebRTC:", error);
        conversationHistory.push({ role: "system", text: "Error starting session." });
        updateConversationUI();
    }
}

// Function to continuously capture user speech input and send it to OpenAI
async function captureUserSpeech() {
    try {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.continuous = true; // Keep listening indefinitely
        recognition.interimResults = false; // Only return final results
        recognition.start();

        recognition.onresult = (event) => {
            const userSpeech = event.results[event.results.length - 1][0].transcript;
            console.log("User said:", userSpeech);

            // Add user's speech to conversation history
            conversationHistory.push({ role: "user", text: userSpeech });
            updateConversationUI();

            // Send message to OpenAI via WebRTC
            const message = {
                type: "response.create",
                response: {
                    modalities: ["text"],
                    instructions: userSpeech,
                },
            };
            dc.send(JSON.stringify(message));
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        recognition.onend = () => {
            console.log("Speech recognition stopped, restarting...");
            setTimeout(captureUserSpeech, 1000); // Restart speech recognition
        };
    } catch (error) {
        console.error("Error capturing user speech:", error);
    }
}

// Function to update UI with conversation history
function updateConversationUI() {
    const container = document.getElementById("response-container");
    container.innerHTML = ""; // Clear previous content

    conversationHistory.forEach(msg => {
        const div = document.createElement("div");
        div.style.padding = "5px";
        div.style.borderBottom = "1px solid #ddd";

        if (msg.role === "assistant") {
            div.style.color = "blue"; // Assistant messages in blue
            div.innerHTML = `<strong>Assistant:</strong> ${msg.text}`;
        } else if (msg.role === "user") {
            div.style.color = "green"; // User messages in green
            div.innerHTML = `<strong>You:</strong> ${msg.text}`;
        } else {
            div.style.color = "gray"; // System messages in gray
            div.innerHTML = `<em>${msg.text}</em>`;
        }

        container.appendChild(div);
    });

    // Scroll to the latest message
    container.scrollTop = container.scrollHeight;
}

// Function to End Session
function endSession() {
    if (dc) {
        dc.close();
        console.log("Data channel closed.");
    }
    if (pc) {
        pc.getSenders().forEach(sender => {
            if (sender.track) {
                sender.track.stop();
            }
        });
        pc.close();
        console.log("Peer connection closed.");
    }
    pc = null;
    dc = null;

    conversationHistory.push({ role: "system", text: "Session ended." });
    updateConversationUI();
}

// Attach functions to buttons
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startSession").addEventListener("click", startConnection);
    document.getElementById("endSession").addEventListener("click", endSession);
});
