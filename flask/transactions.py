from flask import make_response, abort
from config import db
from models import Client, Transaction, TransactionSchema


def read_all():
    transactions = Transaction.query.order_by(db.desc(Transaction.currentDhm)).all()

    transaction_schema = TransactionSchema(many=True, exclude=["client.transactions"])
    data = transaction_schema.dump(transactions).data
    return data


def read_one(clientId, TicketNumber):
    transaction = (
        Transaction.query.join(Client, Client.clientId == Transaction.clientId)
        .filter(Client.clientId == clientId)
        .filter(Transaction.TicketNumber == TicketNumber)
        .one_or_none()
    )
    if transaction is not None:
        transaction_schema = TransactionSchema()
        data = transaction_schema.dump(transaction).data
        return data
    else:
        abort(404, f"Transaction not found for Id: {TicketNumber}")


def create(clientId, transaction):
    client = Client.query.filter(Client.clientId == clientId).one_or_none()
    if client is None:
        abort(404, f"Client not found for Id: {clientId}")
    schema = TransactionSchema()
    new_transaction = schema.load(transaction, session=db.session).data
    client.notes.append(new_transaction)
    db.session.commit()
    data = schema.dump(new_transaction).data

    return data, 201


def update(clientId, TicketNumber, transaction):

    update_transaction = (
        Transaction.query.filter(Client.clientId == clientId)
        .filter(Transaction.TicketNumber == TicketNumber)
        .one_or_none()
    )

    if update_transaction is not None:

        schema = TransactionSchema()
        update = schema.load(transaction, session=db.session).data
        update.clientId = update_transaction.clientId
        update.TicketNumber = update_transaction.TicketNumber

        db.session.merge(update)
        db.session.commit()

        data = schema.dump(update_transaction).data

        return data, 200

    else:
        abort(404, f"Transaction not found for Id: {TicketNumber}")


def delete(clientId, TicketNumber):

    transaction = (
        Transaction.query.filter(Client.clientId == clientId)
        .filter(Transaction.TicketNumber == TicketNumber)
        .one_or_none()
    )

    if transaction is not None:
        db.session.delete(transaction)
        db.session.commit()
        return make_response(
            "Transaction {TicketNumber} deleted".format(TicketNumber=TicketNumber), 200
        )
    else:
        abort(404, f"Transaction not found for Id: {TicketNumber}")