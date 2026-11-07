checkAuth();

const usersTable = document.getElementById("usersTable");
const groupsTable = document.getElementById("groupsTable");

let currentTab = "users";
let editingUser = null;
let groupsCache = [];

document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTab = btn.dataset.tab;
        document.getElementById("usersTab").style.display = currentTab === "users" ? "block" : "none";
        document.getElementById("groupsTab").style.display = currentTab === "groups" ? "block" : "none";
        loadData();
    });
});

document.getElementById("searchInput").addEventListener("keyup", loadData);

async function loadData(){
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    if(currentTab==="groups"){
        loadGroups(keyword);
    }else{
        loadUsers(keyword);
    }
}

async function loadUsers(keyword=""){
    usersTable.innerHTML =
        `<tr>
            <td colspan="6">
                Loading...
            </td>
        </tr>`;
    try {
        const response = await fetch("/api/users", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        if (!response.ok) {
            throw new Error("Failed to load users");
        }
        const users = await response.json();
        console.log(users);
        usersTable.innerHTML = "";
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(keyword) ||
            user.home.toLowerCase().includes(keyword) ||
            user.shell.toLowerCase().includes(keyword)
        );

        if (filtered.length === 0) {
            usersTable.innerHTML =
                `<tr>
                    <td colspan="6">No users found.</td>
                </tr>`;
            return;
        }

        filtered.forEach(user => {
            let groups = user.groups.join(", ");
            if (groups.length > 35) {
                groups = groups.substring(0, 35) + "...";
            }
            usersTable.innerHTML += `
                <tr>
                    <td>${user.uid}</td>
                    <td>${user.username}</td>
                    <td>${user.home}</td>
                    <td title="${user.groups.join(", ")}">${groups}</td>
                    <td>
                        <button class="action-btn" onclick="editUser('${user.username}')"> Edit</button>
                        <button class="action-btn" onclick="deleteUser('${user.username}')"> Delete</button>
                    </td>
                </tr>`;
        });

    } catch (err) {
        console.error(err);
        usersTable.innerHTML =
            `<tr>
                <td colspan="6">
                    Failed to load users.
                </td>
            </tr>`;
    }
}

async function loadGroups(keyword=""){
    groupsTable.innerHTML =
        `<tr>
            <td colspan="4">
                Loading...
            </td>
        </tr>`;
    try {
        const response = await fetch("/api/groups", {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        if (!response.ok) {
            throw new Error("Failed to load groups");
        }

        const groups = await response.json();
        groupsTable.innerHTML = "";
        const filtered = groups.filter(group =>
            group.name.toLowerCase().includes(keyword)
        );

        if (filtered.length === 0) {
            groupsTable.innerHTML =
                `<tr>
                    <td colspan="4">No groups found.</td>
                </tr>`;
            return;
        }

        filtered.forEach(group => {
            let members = group.members.join(", ");
            if (members.length > 40) {
                members = members.substring(0, 40) + "...";
            }
            groupsTable.innerHTML += `
                <tr>
                    <td>${group.gid}</td>
                    <td>${group.name}</td>
                    <td title="${group.members.join(", ")}">${members}</td>
                    <td>
                        <button class="action-btn" onclick="editGroup('${group.name}')">Edit</button>
                        <button class="action-btn" onclick="deleteGroup('${group.name}')">Delete</button>
                    </td>
                </tr>`;
        });

    } catch (err) {
        console.error(err);
        groupsTable.innerHTML =
            `<tr>
                <td colspan="4">
                    Failed to load groups.
                </td>
            </tr>`;
    }
}

async function loadGroupsCache(){
    const response = await fetch("/api/groups",{
        headers:{
            Authorization:"Bearer "+token
        }
    });
    groupsCache = await response.json();
}

async function openUserModal(username=null){
    await loadGroupsCache();
    editingUser = username;
    document.getElementById("userModal").style.display="block";
    const primary = document.getElementById("primaryGroup");

    primary.innerHTML="";
    groupsCache.forEach(group=>{
        primary.innerHTML+=`
        <option value="${group.name}">
            ${group.name}
        </option>`;
    });
    renderCheckboxes([]);
    if(username){
        document.getElementById("modalTitle").innerText="Edit User";
        loadUser(username);
    }else{
        document.getElementById("modalTitle").innerText="Add User";
        document.getElementById("username").readOnly=false;
        document.getElementById("username").value="";
        document.getElementById("password").value="";
        document.getElementById("home").value="/home/";
    }
}

function renderCheckboxes(selected){
    const container = document.getElementById("groupCheckboxes");
    container.innerHTML="";
    groupsCache.forEach(group=>{
        const checked = selected.includes(group.name) ? "checked" : "";
        container.innerHTML+=`
            <div style="display:flex; width:auto; gap:2px;">
            <input type="checkbox" style="width:auto;" value="${group.name}" ${checked}>
            <label>${group.name}</label>
            </div>`;
    });
}

async function loadUser(username){
    const response =
        await fetch("/api/users/"+username,{
                headers:{
                    Authorization: "Bearer "+token}
        });

    const user = await response.json();
    document.getElementById("username").value=user.username;
    document.getElementById("username").readOnly=true;
    document.getElementById("home").value=user.home;
    document.getElementById("shell").value=user.shell;
    document.getElementById("primaryGroup").value=user.groups[0];
    renderCheckboxes(user.groups);
}

function closeUserModal(){
    document.getElementById("userModal").style.display="none";
}

const groups=[];

document.querySelectorAll("#groupCheckboxes input:checked").forEach(c=>{
    groups.push(c.value);
});

document.addEventListener("DOMContentLoaded",() => {loadData();});
