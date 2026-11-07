checkAuth();

const MAX_POINTS = 60;
const rxData = [];
const txData = [];
const networkLabels = [];

function updateGauge(gauge, value) {
    const level = Math.max(0, Math.min(100, value));
    const activeSegments = Math.round(level / 10);
    gauge.setAttribute("aria-valuenow", String(Math.round(level)));

    [...gauge.children].forEach((segment, index) => {
        segment.classList.toggle("active", index >= gauge.children.length - activeSegments);
    });
}

document.querySelectorAll(".classic-gauge").forEach(gauge => {
    for (let index = 0; index < 10; index += 1) {
        gauge.appendChild(document.createElement("span"));
    }
});

const networkChart = new Chart(document.getElementById("networkChart"), {
    type: "line",
    data: {
        labels: networkLabels,
        datasets: [
            {
                label: "Receive",
                data: rxData,
                fill: false,
                borderColor: "#00ff36",
                borderWidth: 1,
                pointRadius: 0,
            },
            {
                label: "Send",
                data: txData,
                fill: false,
                borderColor: "#ff3030",
                borderWidth: 1,
                pointRadius: 0,
            }
        ],
    },
    options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: { display: false },
                grid: {
                    color: "#006b28",
                    lineWidth: 0.6,
                    drawTicks: false
                },
                border: { display: false }
            },
            y: {
                min: 0,
                max: 10,
                ticks: { display: false },
                grid: {
                    color: "#006b28",
                    lineWidth: 0.6,
                    drawTicks: false
                },
                border: { display: false }
            }
        }
    }
});

function formatNetworkRate(value) {
    return value >= 1024
        ? `${(value / 1024).toFixed(2)} MB/s`
        : `${value.toFixed(1)} KB/s`;
}

function formatMemoryUsage(used, total) {
    const usedMb = used * 1024;
    const totalMb = total * 1024;
    const label = usedMb >= 1024
        ? `${(usedMb / 1024).toFixed(2)} GB`
        : `${Math.round(usedMb)} MB`;
    return { label, title: `${used.toFixed(2)} GB of ${total.toFixed(2)} GB` };
}

async function loadMetrics() {
    const response = await fetch("/api/metrics", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location = "/";
        return;
    }

    const data = await response.json();
    const rx = Math.max(0, data.network.rx_kbps);
    const tx = Math.max(0, data.network.tx_kbps);

    rxData.push(rx);
    txData.push(tx);
    networkLabels.push("");
    if (networkLabels.length > MAX_POINTS) {
        rxData.shift();
        txData.shift();
        networkLabels.shift();
    }

    updateGauge(document.getElementById("cpuGauge"), data.cpu.usage_percent);
    updateGauge(document.getElementById("memoryGauge"), data.memory.percent);
    document.getElementById("cpuValue").textContent =
        `${Math.round(data.cpu.usage_percent)}%`;

    const memory = formatMemoryUsage(data.memory.used, data.memory.total);
    const memoryValue = document.getElementById("memoryValue");
    memoryValue.textContent = memory.label;
    memoryValue.title = memory.title;

    document.getElementById("rxValue").textContent = formatNetworkRate(rx);
    document.getElementById("txValue").textContent = formatNetworkRate(tx);

    const largestRate = Math.max(...rxData, ...txData);
    networkChart.options.scales.y.max = Math.max(
        10,
        Math.ceil(largestRate / 10) * 10
    );
    networkChart.update("none");

    document.getElementById("storageInfo").innerHTML = `
        ${data.disk.used}/${data.disk.total} GB
        <br>
        ${data.disk.percent} %`;

    document.getElementById("uptimeInfo").innerHTML = `
        ${Math.floor(data.uptime.seconds / 86400)} Days`;
}

async function loadHardware() {
    const response = await fetch("/api/hardware", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (response.status === 401) {
        localStorage.clear();
        window.location = "/";
        return;
    }

    const data = await response.json();

    document.getElementById("hardware-info").innerHTML = `
    <strong>Board : </strong>Product -> ${data.board.product}(${data.board.bios_vendor}), v=${data.board.bios_version} from ${data.board.manufacturer}<br>
    <strong>CPU : </strong>${data.cpu.cores} Cores / ${data.cpu.threads} Threads<br>
    <strong>Memory : </strong>${data.memory.total_gb} GB<br>
    <strong>Network : </strong>(${data.network[0].name}: ${data.network[0].ipv4}; ${data.network[1].name}: ${data.network[1].ipv4} )<br>
    <strong>Storage : </strong>${data.storage} GB<br>
    <strong>System : </strong>${data.system.architecture} - host: ${data.system.hostname} kernel -> ${data.system.kernel}(${data.system.os})`;
}

loadMetrics();
loadHardware();
setInterval(loadMetrics, 2000);