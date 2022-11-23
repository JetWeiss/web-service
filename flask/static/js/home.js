class Model {
    async read() {
        let options = {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        };
        let response = await fetch("/api/transactions", options);
        let data = await response.json();
        return data;
    }
}

class View {
    constructor() {
        this.table = document.querySelector(".blog table");
        this.error = document.querySelector(".error");
    }

    buildTable(transactions) {
        let tbody = this.table.createTBody();
        let html = "";

        transactions.forEach((transaction) => {
            html += `
            <tr data-clientId="${transaction.client.clientId}" data-TicketNumber="${transaction.TicketNumber}">
                <td class="currentDhm">${transaction.currentDhm}</td>
                <td class="name">${transaction.client.plazaId} ${transaction.client.laneId}</td>
                <td class="content">${transaction.TicketNumber}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    errorMessage(message) {
        this.error.innerHTML = message;
        this.error.classList.remove("hidden");
        this.error.classList.add("visible");
        setTimeout(() => {
            this.error.classList.remove("visible");
            this.error.classList.add("hidden");
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
        try {
            let transations = await this.model.read();
            this.view.buildTable(transations);
        } catch(err) {
            this.view.errorMessage(err);
        }

        document.querySelector("table tbody").addEventListener("dblclick", (evt) => {
            let target = evt.target,
                parent = target.parentElement;

            if (target.classList.contains("lane")) {
                let clientId = parent.getAttribute("data-clientId");

                window.location = `/client/${clientId}`;

            } else if (target.classList.contains("frontLpn")) {
                let clientId = parent.getAttribute("data-clientId"),
                    TicketNumber = parent.getAttribute("data-TicketNumber");

                window.location = `client/${clientId}/transactions/${TicketNumber}`;
            }
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