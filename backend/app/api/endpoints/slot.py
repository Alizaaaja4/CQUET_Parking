from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db.models import db, Slot, User
from sqlalchemy import func

bp = Blueprint('slot', __name__)

@bp.route('/available', methods=['GET'])
def get_available_slots():
    """Get available slots for parking navigation"""
    try:
        # Get query parameters
        level = request.args.get('level')
        zone = request.args.get('zone')
        
        query = Slot.query.filter_by(status=True)  # available slots
        
        if level:
            query = query.filter_by(level=level)
        if zone:
            query = query.filter_by(zone=zone)
        
        slots = query.all()
        
        # Group by level and zone for better navigation
        grouped_slots = {}
        for slot in slots:
            level_key = slot.level
            if level_key not in grouped_slots:
                grouped_slots[level_key] = {}
            
            zone_key = slot.zone
            if zone_key not in grouped_slots[level_key]:
                grouped_slots[level_key][zone_key] = []
            
            grouped_slots[level_key][zone_key].append(slot.to_dict())
        
        return jsonify({
            'available_slots': grouped_slots,
            'total_available': len(slots)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/recommend', methods=['GET'])
def recommend_slot():
    """Recommend closest available slot"""
    try:
        # Get the first available slot (can be enhanced with proximity logic)
        slot = Slot.query.filter_by(status=True).first()
        
        if not slot:
            return jsonify({'error': 'No available slots'}), 404
        
        return jsonify({
            'recommended_slot': slot.to_dict(),
            'navigation_info': {
                'level': slot.level,
                'zone': slot.zone,
                'slot_id': slot.slot_id
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/occupy', methods=['POST'])
def occupy_slot():
    """Mark slot as occupied when vehicle enters"""
    try:
        data = request.get_json()
        slot_id = data.get('slot_id')
        
        if not slot_id:
            return jsonify({'error': 'Slot ID required'}), 400
        
        slot = Slot.query.filter_by(slot_id=slot_id).first()
        
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        if not slot.status:
            return jsonify({'error': 'Slot already occupied'}), 400
        
        slot.status = False  # Mark as occupied
        db.session.commit()
        
        return jsonify({
            'message': 'Slot marked as occupied',
            'slot': slot.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/release', methods=['POST'])
def release_slot():
    """Mark slot as available when vehicle exits"""
    try:
        data = request.get_json()
        slot_id = data.get('slot_id')
        
        if not slot_id:
            return jsonify({'error': 'Slot ID required'}), 400
        
        slot = Slot.query.filter_by(slot_id=slot_id).first()
        
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        slot.status = True  # Mark as available
        db.session.commit()
        
        return jsonify({
            'message': 'Slot marked as available',
            'slot': slot.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Admin endpoints for slot management
@bp.route('/', methods=['GET'])
@jwt_required()
def get_all_slots():
    """Get all slots - Admin & Operator only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'operator']:
            return jsonify({'error': 'Admin & Operator access required'}), 403
        
        slots = Slot.query.all()
        
        # Statistics
        total_slots = len(slots)
        available_slots = len([s for s in slots if s.status])
        occupied_slots = total_slots - available_slots
        
        return jsonify({
            'slots': [slot.to_dict() for slot in slots],
            'statistics': {
                'total': total_slots,
                'available': available_slots,
                'occupied': occupied_slots
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_slot():
    """Create new slot - Admin & Operator only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'operator']:
            return jsonify({'error': 'Admin & Operator access required'}), 403
        
        data = request.get_json()
        slot_id = data.get('slot_id')
        level = data.get('level')
        zone = data.get('zone')
        
        if not slot_id or not level or not zone:
            return jsonify({'error': 'slot_id, level, and zone required'}), 400
        
        # Check if slot already exists
        if Slot.query.filter_by(slot_id=slot_id).first():
            return jsonify({'error': 'Slot ID already exists'}), 400
        
        slot = Slot(
            slot_id=slot_id,
            level=level,
            zone=zone,
            status=True
        )
        
        db.session.add(slot)
        db.session.commit()
        
        return jsonify({
            'message': 'Slot created successfully',
            'slot': slot.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:slot_id>', methods=['PUT'])
@jwt_required()
def update_slot(slot_id):
    """Update slot - Admin Operator only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'operator']:
            return jsonify({'error': 'Admin & Operator access required'}), 403
        
        slot = Slot.query.get(slot_id)
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        data = request.get_json()
        
        if 'slot_id' in data:
            slot.slot_id = data['slot_id']
        if 'level' in data:
            slot.level = data['level']
        if 'zone' in data:
            slot.zone = data['zone']
        if 'status' in data:
            slot.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Slot updated successfully',
            'slot': slot.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:slot_id>', methods=['DELETE'])
@jwt_required()
def delete_slot(slot_id):
    """Delete slot - Admin Operator only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'operator']:
            return jsonify({'error': 'Admin & Operator access required'}), 403
        
        slot = Slot.query.get(slot_id)
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        db.session.delete(slot)
        db.session.commit()
        
        return jsonify({'message': 'Slot deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500