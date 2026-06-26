checkAuth();
let socket = null;
let terminal = null;
let connected = false;

function initTerminal() {
    terminal = new Terminal({
        cursorBlink: true,
        rows: 30,
        cols: 150,
        convertEol: true,
        theme: {
            background: "#000000"
        }
    });

    terminal.open(document.getElementById("terminal"));
    terminal.writeln("Mini Monitor Terminal");
    terminal.writeln("-----------------------------");
    terminal.writeln("Click CONNECT to start.");
    terminal.writeln("");

    // Register hanya SEKALI
    terminal.onData((data) => {
        if (!connected) {
            return;
        }
        socket.emit("terminal_input", {input: data});
    });

}

function connectTerminal() {
    if (connected) {
        return;
    }
    terminal.clear();
    terminal.writeln("Connecting...");
    socket = io({
        auth: {
            token: token
        }
    });

    socket.on("connect", () => {
        connected = true;
        document.getElementById("terminalStatus").innerHTML = "🟢 Connected";
        document.getElementById("btnConnect").disabled = true;
        document.getElementById("btnDisconnect").disabled = false;
        terminal.clear();
        socket.emit("terminal_connect");
    });

    socket.on("terminal_output", (data) => {
        terminal.write(data);
    });

    socket.on("disconnect", () => {
        connected = false;
        document.getElementById("terminalStatus").innerHTML ="🔴 Disconnected";
        document.getElementById("btnConnect").disabled = false;
        document.getElementById("btnDisconnect").disabled = true;
        terminal.writeln("\r\nDisconnected.");
    });

    socket.on("connect_error", (err) => {
        console.error(err);
        connected = false;
        terminal.writeln("\r\nConnection Failed.");
    });
}

function disconnectTerminal() {
    if (!connected) {
        return;
    }
    socket.emit("terminal_disconnect");
    socket.disconnect();
}

document.getElementById("btnConnect").addEventListener("click", () => {
    connectTerminal();
});

document.getElementById("btnDisconnect").addEventListener("click", () => {
    disconnectTerminal();
});

window.addEventListener("beforeunload", () => {
    disconnectTerminal();
});

document.addEventListener("DOMContentLoaded", () => {
    initTerminal();
});