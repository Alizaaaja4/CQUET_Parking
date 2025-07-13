from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db.models import db, Payment, Slot, User
from datetime import datetime, timedelta
import qrcode
import io
import base64
import requests
import uuid
import os
from sqlalchemy import func

bp = Blueprint('payment', __name__)

MIDTRANS_SERVER_KEY = os.getenv("MIDTRANS_SERVER_KEY")

@bp.route('/entry', methods=['POST'])
def create_entry():
    """Create parking entry record"""
    try:
        data = request.get_json()
        vehicle_plate = data.get('vehicle_plate')
        slot_id = data.get('slot_id')
        vehicle_type = data.get('vehicle_type', 'car')
        
        if not vehicle_plate or not slot_id:
            return jsonify({'error': 'Vehicle plate and slot ID required'}), 400
        
        # Find slot
        slot = Slot.query.filter_by(slot_id=slot_id).first()
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        if not slot.status:
            return jsonify({'error': 'Slot not available'}), 400
        
        # Create payment record
        payment = Payment(
            slot_id=slot.id,
            vehicle_plate=vehicle_plate,
            vehicle_type=vehicle_type,
            entry_time=datetime.utcnow(),
            status='unpaid'
        )
        
        # Mark slot as occupied
        slot.status = False
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Entry recorded successfully',
            'payment': payment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def create_qris_payment(amount, order_id):
    url = "https://api.sandbox.midtrans.com/v2/charge"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {
        "payment_type": "qris",
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": int(amount)
        }
    }
    response = requests.post(
        url,
        json=payload,
        auth=(MIDTRANS_SERVER_KEY, "")
    )
    return response.json()


@bp.route('/exit', methods=['POST'])
def process_exit():
    """Process parking exit and generate QRIS payment (Midtrans)"""
    try:
        data = request.get_json()
        vehicle_plate = data.get('vehicle_plate')
        
        if not vehicle_plate:
            return jsonify({'error': 'Vehicle plate required'}), 400
        
        # Find active payment record
        payment = Payment.query.filter_by(
            vehicle_plate=vehicle_plate,
            status='unpaid'
        ).first()
        
        if not payment:
            return jsonify({'error': 'No active parking session found'}), 404
        
        # Calculate duration and amount
        payment.exit_time = datetime.utcnow()
        payment.duration = payment.exit_time - payment.entry_time
        payment.amount = payment.calculate_amount()
        
        # ==== MIDTRANS QRIS ==== #
        order_id = str(uuid.uuid4())
        payment.payment_id = order_id  # simpan order id agar bisa dilacak konfirmasi
        midtrans_resp = create_qris_payment(payment.amount, order_id)
        qr_url = ""
        for action in midtrans_resp.get("actions", []):
            if action.get("name") == "generate-qr-code":
                qr_url = action.get("url")
                break
        payment.qr_code = qr_url
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exit processed successfully',
            'payment': payment.to_dict(),
            'qris_url': qr_url,
            'payment_info': {
                'amount': float(payment.amount),
                'duration': str(payment.duration),
                'vehicle_plate': payment.vehicle_plate
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/confirm', methods=['POST'])
def confirm_payment():
    """Confirm payment and release slot"""
    try:
        data = request.get_json()
        payment_id = data.get('payment_id')
        
        if not payment_id:
            return jsonify({'error': 'Payment ID required'}), 400
        
        payment = Payment.query.filter_by(payment_id=payment_id).first()
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        if payment.status == 'paid':
            return jsonify({'error': 'Payment already confirmed'}), 400
        
        # Mark payment as paid
        payment.status = 'paid'
        
        # Release slot
        slot = payment.slot
        if slot:
            slot.status = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment confirmed successfully',
            'payment': payment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Get payment history - Admin only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Payment.query
        
        if status:
            query = query.filter_by(status=status)
        
        if start_date:
            start_date = datetime.fromisoformat(start_date)
            query = query.filter(Payment.entry_time >= start_date)
        
        if end_date:
            end_date = datetime.fromisoformat(end_date)
            query = query.filter(Payment.entry_time <= end_date)
        
        # Order by newest first
        query = query.order_by(Payment.created_at.desc())
        
        # Pagination
        payments = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Calculate total revenue
        total_revenue = db.session.query(func.sum(Payment.amount)).filter_by(status='paid').scalar() or 0
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments.items],
            'pagination': {
                'page': payments.page,
                'pages': payments.pages,
                'per_page': payments.per_page,
                'total': payments.total
            },
            'statistics': {
                'total_revenue': float(total_revenue),
                'total_transactions': payments.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    """Get payment statistics - Admin only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Today's statistics
        today = datetime.now().date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        today_payments = Payment.query.filter(
            Payment.entry_time >= today_start,
            Payment.entry_time <= today_end
        ).all()
        
        today_revenue = sum(p.amount for p in today_payments if p.status == 'paid')
        
        # Monthly statistics
        month_start = datetime.now().replace(day=1)
        month_payments = Payment.query.filter(
            Payment.entry_time >= month_start
        ).all()
        
        month_revenue = sum(p.amount for p in month_payments if p.status == 'paid')
        
        # Overall statistics
        total_payments = Payment.query.count()
        total_revenue = db.session.query(func.sum(Payment.amount)).filter_by(status='paid').scalar() or 0
        
        return jsonify({
            'today': {
                'transactions': len(today_payments),
                'revenue': float(today_revenue),
                'paid_transactions': len([p for p in today_payments if p.status == 'paid'])
            },
            'month': {
                'transactions': len(month_payments),
                'revenue': float(month_revenue),
                'paid_transactions': len([p for p in month_payments if p.status == 'paid'])
            },
            'total': {
                'transactions': total_payments,
                'revenue': float(total_revenue)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_sessions():
    """Get active parking sessions - Admin only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        active_payments = Payment.query.filter_by(status='unpaid').all()
        
        return jsonify({
            'active_sessions': [payment.to_dict() for payment in active_payments],
            'count': len(active_payments)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500