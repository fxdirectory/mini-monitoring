checkAuth();

const MAX_POINTS = 10;
const cpuData = [];
const memoryData = [];
const rxData = [];
const txData = [];
const labels = [];

const cpuChart = new Chart(
    document.getElementById("cpuChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "CPU %",
            data: cpuData,
            fill: false,
            borderColor: '#00000',
            tension: 0,
            borderWith: 1,
            pointRadius: 0,
        }]
    },
    options: {
        animation: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        }
    }
}
);

const memoryChart = new Chart(
    document.getElementById("memoryChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Memory %",
            data: memoryData,
            fill: false,
            borderColor: '#00000',
            tension: 0,
            borderWith: 1,
            pointRadius: 0,
        }]
    },
    options: {
        animation: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        }
    }
}
);

const networkChart = new Chart(
    document.getElementById("networkChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "RX KB/s",
                data: rxData,
                fill: false,
                borderColor: '#00000',
                tension: 0,
                borderWith: 1,
                pointRadius: 0,
            },
            {
                label: "TX KB/s",
                data: txData,
                fill: false,
                borderColor: 'red',
                tension: 0,
                borderWith: 1,
                pointRadius: 0,
            }
        ],
    },
    options: {
        animation: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        }
    }
}
);

async function loadMetrics() {

    const response = await fetch("/api/metrics", {
        headers: {
            Authorization:
                "Bearer " + token
        }
    }
    );

    if (response.status === 401) {
        localStorage.clear();
        window.location = "/";
    }

    const data = await response.json();

    const now = new Date().toLocaleTimeString();

    labels.push(now);

    cpuData.push(data.cpu.usage_percent);
    memoryData.push(data.memory.percent);
    rxData.push(data.network.rx_kbps);
    txData.push(data.network.tx_kbps);
    if (labels.length > MAX_POINTS) {
        labels.shift();
        cpuData.shift();
        memoryData.shift();
        rxData.shift();
        txData.shift();
    }

    cpuChart.update();
    memoryChart.update();
    networkChart.update();

    document.getElementById("storageInfo").innerHTML = `
        ${data.disk.used}/${data.disk.total} GB
        <br>
        ${data.disk.percent} %`;

    document.getElementById("uptimeInfo").innerHTML = `
        ${Math.floor(data.uptime.seconds / 86400)} Days`;
}

async function loadHardware(){
    const response = await fetch("/api/hardware", {
        headers: {
            Authorization:
                "Bearer " + token
        }
    }
    );

    if (response.status === 401) {
        localStorage.clear();
        window.location = "/";
    }

    const data = await response.json();
    
    console.log(data);

    document.getElementById("cpu-info").innerHTML = `
    <label>Model : </label><br>
    <label>Cores : </label>${data.cpu.cores} Cores<br>
    <label>Threads : </label>${data.cpu.threads} Threads`;
}

loadMetrics();
loadHardware();
setInterval(loadMetrics, 2000);