class Model {
    async read(clientId) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        };
        let response = await fetch(`/api/client/${clientId}`, options);
        let data = await response.json();
        return data;
    }

    async readOne(clientId, TicketNumber) {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch(`/api/client/${clientId}/transactions/${TicketNumber}`, options);
        let data = await response.json();
        return data;
    }

    async create(clientId, transaction) {
        let options = {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(transaction)
        };
        let response = await fetch(`/api/client/${clientId}/transactions`, options);
        let data = await response.json();
        return data;
    }

    async update(clientId, transaction) {
        let options = {
            method: "PUT",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            },
            body: JSON.stringify(transaction)
        };
        let response = await fetch(`/api/client/${clientId}/transactions/${transaction.TicketNumber}`, options);
        let data = await response.json();
        return data;
    }

    async delete(clientId, TicketNumber) {
        let options = {
            method: "DELETE",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "accepts": "application/json"
            }
        };
        let response = await fetch(`/api/client/${clientId}/transactions/${TicketNumber}`, options);
        return response;
    }
}
class View {
    constructor() {
        this.NEW_TRANSACTION = 0;
        this.EXISTING_TRANSACTION = 1;
        this.table = document.querySelector(".transactions table");
        this.error = document.querySelector(".error");
        this.clientId = document.getElementById("clientId");
        this.plazaId = document.getElementById("plazaId");
        this.laneId = document.getElementById("laneId");
        this.currentDhm = document.getElementById("currentDhm");
        this.TicketNumber = document.getElementById("TicketNumber");
        this.transaction = document.getElementById("transaction");
        this.createButton = document.getElementById("create");
        this.updateButton = document.getElementById("update");
        this.deleteButton = document.getElementById("delete");
        this.resetButton = document.getElementById("reset");
    }

    reset() {
        this.TicketNumber.textContent = "";
        this.transaction.value = "";
        this.transaction.focus();
    }

    updateEditor(transaction) {
        this.TicketNumber.textContent = transaction.TicketNumber;
        this.transaction.value = transaction.content;
        this.transaction.focus();
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

        this.clientId.textContent = client.clientId;
        this.plazaId.textContent = client.plazaId;
        this.laneId.textContent = client.laneId;
        this.currentDhm.textContent = client.currentDhm;

        client.transactions.forEach((transaction) => {
            html += `
            <tr data-TicketNumber="${transaction.TicketNumber}" data-frontLpn="${transaction.frontLpn}">
                <td class="currentDhm">${transaction.currentDhm}</td>
                 <td class="content">${transaction.frontLpn}</td>
            </tr>`;
        });
        if (this.table.tBodies.length !== 0) {
            this.table.removeChild(this.table.getElementsByTagName("tbody")[0]);
        }
        tbody = this.table.createTBody();
        tbody.innerHTML = html;
    }

    errorMessage(error_msg) {
        let error = document.querySelector(".error");

        error.innerHTML = error_msg;
        error.classList.add("visible");
        error.classList.remove("hidden");
        setTimeout(() => {
            error.classList.add("hidden");
            error.classList.remove("visible");
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
                urlTicketNumber = +document.getElementById("url_TicketNumber").value,
                client = await this.model.read(urlClientId);

            this.view.buildTable(client);

            if (urlTicketNumber) {
                let transaction = await this.model.readOne(urlClientId, urlTicketNumber);
                this.view.updateEditor(transaction);
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
        document.querySelector("table tbody").addEventListener("click", (evt) => {
            let target = evt.target.parentElement,
                TicketNumber = target.getAttribute("data-TicketNumber")

            this.view.updateEditor({
                TicketNumber: TicketNumber
            });
            this.view.setButtonState(this.view.EXISTING_TRANSACTION);
        });
    }

    initializeCreateEvent() {
        document.getElementById("create").addEventListener("click", async (evt) => {
            let urlClientId = +document.getElementById("clientId").textContent,
                transaction = document.getElementById("transaction").value;

            evt.preventDefault();
            try {
                await this.model.create(urlClientId, {
                    content: transaction
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeUpdateEvent() {
        document.getElementById("update").addEventListener("click", async (evt) => {
            let clientId = +document.getElementById("clientId").textContent,
                TicketNumber = +document.getElementById("TicketNumber").textContent,
                transaction = document.getElementById("transaction").value;

            evt.preventDefault();
            try {
                await this.model.update(clientId, {
                    clientId: clientId,
                    TicketNumber: TicketNumber,
                    content: transaction
                });
                await this.initializeTable();
            } catch(err) {
                this.view.errorMessage(err);
            }
        });
    }

    initializeDeleteEvent() {
        document.getElementById("delete").addEventListener("click", async (evt) => {
            let clientId = +document.getElementById("clientId").textContent,
                TicketNumber = +document.getElementById("TicketNumber").textContent;

            evt.preventDefault();
            try {
                await this.model.delete(clientId, TicketNumber);
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