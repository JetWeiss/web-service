from flask import render_template
import config



connex_app = config.connex_app

connex_app.add_api("swagger.yml")


@connex_app.route("/")
def home():
    return render_template("home.html")


@connex_app.route("/client")
@connex_app.route("/client/<int:clientId>")
def client(clientId=""):
    return render_template("client.html", clientId=clientId)


@connex_app.route("/client/<int:clientId>")
@connex_app.route("/client/<int:clientId>/transactions")
@connex_app.route("/client/<int:clientId>/transactions/<string:TicketNumber>")
def transactions(clientId, TicketNumber=""):
    return render_template("transactions.html", clientId=clientId, TicketNumber=TicketNumber)


if __name__ == "__main__":
    connex_app.run(debug=True)