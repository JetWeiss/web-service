import os
from datetime import datetime
from config import db
from models import Client, Transaction

PEOPLE = [
    {
        "plazaId": "21",
        "laneId": "E51",
        "transactions": [
            ("Y924KE178",
             "525",
             "2019-01-08 22:17:54"),
        ],
    },
    {
        "plazaId": "83",
        "laneId": "E58",
        "transactions": [
            ("H974ME77",
             "542",
             "2019-01-06 22:17:54"),
        ],
    },
    {
        "plazaId": "47",
        "laneId": "E54",
        "transactions": [
            ("K941BA198",
             "543",
             "2019-01-07 22:17:54"),
        ],
    },
]

if os.path.exists("people.db"):
    os.remove("people.db")

db.create_all()

for client in PEOPLE:
    p = Client(laneId=client.get("laneId"), plazaId=client.get("plazaId"))

    for transaction in client.get("transactions"):
        frontLpn, TicketNumber, currentDhm = transaction
        p.transactions.append(
            Transaction(
                frontLpn=frontLpn,
                TicketNumber=TicketNumber,
                currentDhm=datetime.strptime(currentDhm, "%Y-%m-%d %H:%M:%S"),
            )
        )
    db.session.add(p)

db.session.commit()