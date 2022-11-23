from flask import make_response, abort
from config import db
from models import Client, ClientSchema, Transaction

def read_all():
    client = Client.query.order_by(Client.laneId).all()
    client_schema = ClientSchema(many=True)
    data = client_schema.dump(client).data
    return data

def read_one(clientId):
    client = (
        Client.query.filter(Client.clientId == clientId)
        .outerjoin(Transaction)
        .one_or_none()
    )

    if client is not None:
        client_schema = ClientSchema()
        data = client_schema.dump(client).data
        return data
    else:
        abort(404, f"Client not found for Id: {clientId}")


def create(client):
    plazaId = client.get("plazaId")
    laneId = client.get("laneId")

    existing_person = (
        Client.query.filter(Client.plazaId == plazaId)
        .filter(Client.laneId == laneId)
        .one_or_none()
    )

    if existing_person is None:
        schema = ClientSchema()
        new_client = schema.load(client, session=db.session).data
        db.session.add(new_client)
        db.session.commit()
        data = schema.dump(new_client).data

        return data, 201
    else:
        abort(409, f"Client {plazaId} {laneId} exists already")


def update(clientId, client):
    update_client = Client.query.filter(
        Client.clientId == clientId
    ).one_or_none()
    if update_client is not None:
        schema = ClientSchema()
        update = schema.load(client, session=db.session).data
        update.clientId = update_client.clientId

        db.session.merge(update)
        db.session.commit()

        data = schema.dump(update_client).data

        return data, 200
    else:
        abort(404, f"Client not found for Id: {clientId}")


def delete(clientId):
    client = Client.query.filter(Client.clientId == clientId).one_or_none()

    if client is not None:
        db.session.delete(client)
        db.session.commit()
        return make_response(f"Client {clientId} deleted", 200)
    else:
        abort(404, f"Client not found for Id: {clientId}")