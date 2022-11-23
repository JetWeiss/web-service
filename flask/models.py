from datetime import datetime
from config import db, ma
from marshmallow import fields

class Client(db.Model):
   __tablename__ = "client"
   clientId = db.Column(db.Integer, primary_key=True)
   plazaId = db.Column(db.String(32))
   laneId = db.Column(db.String(32))
   TicketNumber = db.Column(db.String(32))
   currentDhm = db.Column(
       db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
   )
   transactions = db.relationship(
       "Transaction",
       backref="client",
       cascade="all, delete, delete-orphan",
       single_parent=True,
       order_by="desc(Transaction.currentDhm)",
   )

class Transaction(db.Model):
    __tablename__ = "transaction"
    clientId = db.Column(db.Integer, db.ForeignKey("client.clientId"))
    plazaId = db.Column(db.String(32))
    frontLpn = db.Column(db.String(32), primary_key=True)
    TicketNumber = db.Column(db.String(32))
    currentDhm = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

class ClientSchema(ma.SQLAlchemyAutoSchema):
    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    class Meta:
        model = Client
        sqla_session = db.session

    transactions = fields.Nested("ClientTransactionSchema", default=[], many=True)


class ClientTransactionSchema(ma.SQLAlchemyAutoSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)
    clientId = fields.Int()
    plazaId = fields.Str()
    frontLpn = fields.Str()
    TicketNumber = fields.Str()
    currentDhm = fields.Str()


class TransactionSchema(ma.SQLAlchemyAutoSchema):
    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    class Meta:
        model = Transaction
        sqla_session = db.session

    client = fields.Nested("TransactionClientSchema", default=None)


class TransactionClientSchema(ma.SQLAlchemyAutoSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)
    clientId = fields.Int()
    plazaId = fields.Str()
    laneId = fields.Str()
    TicketNumber = fields.Str()
    currentDhm = fields.Str()