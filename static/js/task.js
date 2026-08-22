checkAuth();

const servicesTable =
    document.getElementById("servicesTable");

const searchInput =
    document.getElementById("searchInput");

const refreshBtn =
    document.getElementById("refreshBtn");

const pagination =
    document.getElementById("pagination");

const message =
    document.getElementById("message");


let services = [];

let currentPage = 1;

const itemsPerPage = 10;


// ======================================================
// LOAD SERVICES
// ======================================================

async function loadServices() {

    servicesTable.innerHTML = `
        <tr>
            <td colspan="4">
                Loading...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "/api/services",
            {
                headers: {
                    Authorization:
                        "Bearer " + token
                }
            }
        );

        if (response.status === 401) {

            localStorage.clear();

            window.location = "/";

            return;
        }

        if (!response.ok) {

            throw new Error(
                "Failed to load services"
            );

        }

        const result =
            await response.json();

        services = result.data || [];

        currentPage = 1;

        render();

    } catch (error) {

        console.error(error);

        servicesTable.innerHTML = `
            <tr>
                <td colspan="4">
                    Failed to load services.
                </td>
            </tr>
        `;

    }

}


// ======================================================
// FILTER
// ======================================================

function getFilteredServices() {

    const keyword =
        searchInput.value
        .trim()
        .toLowerCase();

    if (!keyword) {

        return services;

    }

    return services.filter(service =>

        service.name
            .toLowerCase()
            .includes(keyword)

    );

}


// ======================================================
// RENDER
// ======================================================

function render() {

    const filtered =
        getFilteredServices();

    const totalPages =
        Math.ceil(
            filtered.length /
            itemsPerPage
        );

    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {

        currentPage = totalPages;

    }

    const start =
        (currentPage - 1) *
        itemsPerPage;

    const end =
        start + itemsPerPage;

    const pageItems =
        filtered.slice(start, end);

    renderTable(pageItems);

    renderPagination(totalPages);

}


// ======================================================
// TABLE
// ======================================================

function renderTable(items) {

    if (items.length === 0) {

        servicesTable.innerHTML = `
            <tr>
                <td colspan="4">
                    No services found.
                </td>
            </tr>
        `;

        return;

    }

    servicesTable.innerHTML = "";

    items.forEach(service => {

        const row =
            document.createElement("tr");

        const status =
            service.status;

        let actions = "";

        if (status === "running") {

            actions = `
                <button
                    onclick="restartService('${escapeHtml(service.name)}')">
                    Restart
                </button>

                <button
                    onclick="stopService('${escapeHtml(service.name)}')">
                    Stop
                </button>
            `;

        } else {

            actions = `
                <button
                    onclick="startService('${escapeHtml(service.name)}')">
                    Start
                </button>
            `;

        }

        row.innerHTML = `

            <td>
                ${escapeHtml(service.name)}
            </td>

            <td>

                <span
                    class="status ${escapeHtml(status)}">

                    ${escapeHtml(status)}

                </span>

            </td>

            <td>
                ${escapeHtml(service.enabled)}
            </td>

            <td>

                <div class="service-action">

                    ${actions}

                </div>

            </td>

        `;

        servicesTable.appendChild(row);

    });

}


// ======================================================
// PAGINATION
// ======================================================

function renderPagination(totalPages) {

    pagination.innerHTML = "";

    if (totalPages <= 1) {

        return;

    }

    const previous =
        document.createElement("button");

    previous.textContent = "‹";

    previous.disabled =
        currentPage === 1;

    previous.addEventListener(
        "click",
        () => {

            currentPage--;

            render();

        }
    );

    pagination.appendChild(previous);


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");

        button.textContent = page;

        if (page === currentPage) {

            button.classList.add("active");

        }

        button.addEventListener(
            "click",
            () => {

                currentPage = page;

                render();

            }
        );

        pagination.appendChild(button);

    }


    const next =
        document.createElement("button");

    next.textContent = "›";

    next.disabled =
        currentPage === totalPages;

    next.addEventListener(
        "click",
        () => {

            currentPage++;

            render();

        }
    );

    pagination.appendChild(next);

}


// ======================================================
// START
// ======================================================

async function startService(name) {

    if (
        !confirm(
            `Start service "${name}"?`
        )
    ) {

        return;

    }

    await serviceAction(
        name,
        "start"
    );

}


// ======================================================
// STOP
// ======================================================

async function stopService(name) {

    if (
        !confirm(
            `Stop service "${name}"?`
        )
    ) {

        return;

    }

    await serviceAction(
        name,
        "stop"
    );

}


// ======================================================
// RESTART
// ======================================================

async function restartService(name) {

    if (
        !confirm(
            `Restart service "${name}"?`
        )
    ) {

        return;

    }

    await serviceAction(
        name,
        "restart"
    );

}


// ======================================================
// SERVICE ACTION
// ======================================================

async function serviceAction(
    name,
    action
) {

    try {

        showMessage(
            `${action} ${name}...`
        );

        const response =
            await fetch(
                `/api/services/${encodeURIComponent(name)}/${action}`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            "Bearer " + token
                    }
                }
            );

        if (response.status === 401) {

            localStorage.clear();

            window.location = "/";

            return;

        }

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                `Failed to ${action} service`
            );

        }

        showMessage(
            `Service "${name}" ${action} successful.`
        );

        // Berikan waktu systemd
        // untuk memperbarui status.

        setTimeout(
            loadServices,
            1000
        );

    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            true
        );

    }

}


// ======================================================
// SEARCH
// ======================================================

searchInput.addEventListener(
    "input",
    () => {

        currentPage = 1;

        render();

    }
);


// ======================================================
// REFRESH
// ======================================================

refreshBtn.addEventListener(
    "click",
    loadServices
);


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    text,
    error = false
) {

    message.textContent = text;

    message.style.display = "block";

    message.className =
        error
            ? "message error"
            : "message";

}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ======================================================
// INIT
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    loadServices
);