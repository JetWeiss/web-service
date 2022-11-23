class Model {
    async read() {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch("/api/client", options);
        let data = await response.json();
        return data;
    }

    async readOne(clientId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch(`/api/client/${clientId}`, options);
        let data = await response.json();
        return data;
    }

    async create(client) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(client)
        };
        let response = await fetch(`/api/client`, options);
        let data = await response.json();
        return data;
    }

    async update(client) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(client)
        };
        let response = await fetch(`/api/client/${client.clientId}`, options);
        let data = await response.json();
        return data;
    }

    async delete(clientId) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch(`/api/client/${clientId}`, options);
        return response;
    }
}
class View {
    constructor() {
        this.NEW_TRANSACTION = 0;
        this.EXISTING_TRANSACTION = 1;
        this.table = document.querySelector(".client table");
        this.error = document.querySelector(".error");
        this.clientId = document.getElementById("clientId");
        this.plazaId = document.getElementById("plazaId");
        this.laneId = document.getElementById("laneId");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.clientId.textContent = "";
        this.laneId.value = "";
        this.plazaId.value = "";
        this.plazaId.focus();
    }

    updateEditor(client) {
        this.clientId.textContent = client.clientId;
        this.laneId.value = client.laneId;
        this.plazaId.value = client.plazaId;
        this.clientId.focus();
    }

    setButtonState(state) {
        if (state === this.NEW_TRANSACTION) {
            this.createButton.disabled = false;
            this.updateButton.disabled = true;
            this.deleteButton.disabled = true;
        } else if (state === this.EXISTING_TRANSACTION) {
            this.createButton.disabled = true;
            this.updateButton.disabled = false;
            this.deleteButton.disabled = false;
        }
    }

    buildTable(client) {
        let tbody,
            html = "";

        client.forEach((client) => {
            html += `
            <tr  data-clientId="${client.clientId}" data-plazaId="${client.plazaId}" data-laneId="${client.laneId}">
                <td class="currentDhm">${client.currentDhm}</td>
                <td class="name">${client.plazaId} ${client.laneId}</td>
            </tr>`;
        });
        if (this.table.tBodies.length !== 0) {
            this.table.removeChild(this.table.getElementsByTagName("tbody")[0]);
        }
        tbody = this.table.createTBody();
        tbody.innerHTML = html;
    }

    errorMessage(message) {
        this.error.innerHTML = message;
        this.error.classList.add("visible");
        this.error.classList.remove("hidden");
        setTimeout(() => {
            this.error.classList.add("hidden");
            this.error.classList.remove("visible");
        }, 2000);
    }
}
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.initialize();
    }

    async initialize() {
        await this.initializeTable();
        this.initializeTableEvents();
        this.initializeCreateEvent();
        this.initializeUpdateEvent();
        this.initializeDeleteEvent();
        this.initializeResetEvent();
    }

    async initializeTable() {
        try {
            let urlClientId = +document.getElementById("url_clientId").value,
                client = await this.model.read();

            this.view.buildTable(client);
            if (urlClientId) {
                let client = await this.model.readOne(urlClientId);
                this.view.updateEditor(client);
                this.view.setButtonState(this.view.EXISTING_TRANSACTION);

            } else {
                this.view.reset();
                this.view.setButtonState(this.view.NEW_TRANSACTION);
            }
            this.initializeTableEvents();
        } catch (err) {
            this.view.errorMessage(err);
        }
    }

    initializeTableEvents() {
        document.querySelector("table tbody").addEventListener("dblclick", (evt)  => {
            let target = evt.target,
                parent = target.parentElement;

            evt.preventDefault();

            if (target) {
                let clientId = parent.getAttribute("data-clientId");

                window.location = `/client/${clientId}/transactions`;
            }
        });
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                clientId = target.getAttribute("data-clientId"),
                plazaId = target.getAttribute("data-plazaId"),
                laneId = target.getAttribute("data-laneId"),
                TicketNumber = target.getAttribute("data-TicketNumber");

            this.view.updateEditor({
                clientId: clientId,
                plazaId: plazaId,
                laneId: laneId,
                TicketNumber: TicketNumber,
            });
            this.view.setButtonState(this.view.EXISTING_TRANSACTION);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let plazaId = document.getElementById("plazaId").value,
                laneId = document.getElementById("laneId").value;

            evt.preventDefault();
            try {
                await this.model.create({
                    plazaId: plazaId,
                    laneId: laneId
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeUpdateEvent() {
        document.getElementById("update").addEventListener("click", async (evt) => {
            let clientId = document.getElementById("clientId").value,
                plazaId = document.getElementById("plazaId").value,
                laneId = document.getElementById("laneId").value;

            evt.preventDefault();
            try {
                await this.model.update({
                    clientId: clientId,
                    plazaId: plazaId,
                    laneId: laneId
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let clientId = +document.getElementById("clientId").value;

            evt.preventDefault();
            try {
                await this.model.delete(clientId);
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeResetEvent() {
        document.getElementById("reset").addEventListener("click", async (evt) => {
            evt.preventDefault();
            this.view.reset();
            this.view.setButtonState(this.view.NEW_TRANSACTION);
        });
    }
}
const model = new Model();
const view = new View();
const controller = new Controller(model, view);
export default {
    model,
    view,
    controller
};