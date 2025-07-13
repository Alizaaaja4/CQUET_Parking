from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    role = db.Column(db.String(50), nullable=False, default='user')  # user, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = db.relationship("Payment", backref="user", lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Slot(db.Model):
    __tablename__ = "slots"

    id = db.Column(db.Integer, primary_key=True)
    slot_id = db.Column(db.String(50), nullable=False, unique=True)
    level = db.Column(db.String(10), nullable=False)  # L1, L2, L3, 
    zone = db.Column(db.String(10), nullable=False)  # A, B, C
    status = db.Column(db.Boolean, default=True)  # True = available, False = occupied
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    payments = db.relationship("Payment", backref="slot", lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'slot_id': self.slot_id,
            'level': self.level,
            'zone': self.zone,
            'status': 'available' if self.status else 'occupied',
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.String(100), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)  # nullable for non-login users
    slot_id = db.Column(db.Integer, db.ForeignKey("slots.id"), nullable=False)
    vehicle_plate = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False, default='car')  # car, motorcycle
    entry_time = db.Column(db.DateTime, nullable=False)
    exit_time = db.Column(db.DateTime)
    duration = db.Column(db.Interval)
    amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    status = db.Column(db.String(20), default='unpaid')  # unpaid, paid
    qr_code = db.Column(db.Text)  # untuk simpan QR code payment
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.payment_id:
            self.payment_id = str(uuid.uuid4())
    
    def calculate_amount(self):
        """Calculate parking fee based on duration"""
        if not self.duration:
            return 0
        
        # Base rates per hour
        rates = {
            'car': 10000,      # 10000 per hour
            'motorcycle': 5000  # 5000 per hour
        }
        
        hours = self.duration.total_seconds() / 3600
        base_rate = rates.get(self.vehicle_type, rates['car'])
        
        # Minimum 1 hour
        if hours < 1:
            hours = 1
        
        return base_rate * hours
    
    def to_dict(self):
        return {
            'id': self.id,
            'payment_id': self.payment_id,
            'user_id': self.user_id,
            'slot_id': self.slot_id,
            'slot': self.slot.to_dict() if self.slot else None,
            'vehicle_plate': self.vehicle_plate,
            'vehicle_type': self.vehicle_type,
            'entry_time': self.entry_time.isoformat(),
            'exit_time': self.exit_time.isoformat() if self.exit_time else None,
            'duration': str(self.duration) if self.duration else None,
            'amount': float(self.amount),
            'status': self.status,
            'qr_code': self.qr_code,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }