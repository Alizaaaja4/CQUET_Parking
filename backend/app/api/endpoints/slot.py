from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db.models import db, Slot, User
from sqlalchemy import func

bp = Blueprint('slot', __name__)

# Define mapping for vehicle types to zones (Backend-side)
vehicle_type_to_zone_map = {
    'Bike': 'A',
    'Car': 'B',
    'Heavy': 'C',
}

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

@bp.route('/recommend', methods=['POST']) # 🔥 Changed to POST method
def recommend_slot():
    """Recommend closest available slot based on vehicle type"""
    try:
        data = request.get_json()
        vehicle_type = data.get('vehicleType') # Get vehicleType from request body
        vehicle_plate = data.get('vehiclePlate') # Get vehiclePlate from request body

        print(f"Backend: /recommend (POST) received request. vehicleType={vehicle_type}, vehiclePlate={vehicle_plate}") # NEW LOG

        if not vehicle_type:
            return jsonify({'error': 'Vehicle type is required for recommendation'}), 400

        # Determine target zone based on vehicle type
        target_zone = vehicle_type_to_zone_map.get(vehicle_type)
        print(f"Backend: Determined target_zone: {target_zone} for vehicleType: {vehicle_type}") # NEW LOG

        if not target_zone:
            return jsonify({'error': f'No parking zone defined for vehicle type: {vehicle_type}'}), 400

        # Query for an available slot in the target zone
        query = Slot.query.filter_by(status=True, zone=target_zone)
        print(f"Backend: Querying for available slot in zone: {target_zone}") # NEW LOG
        
        # You can add more complex logic here (e.g., order by level, then slot_id)
        # For now, it gets the first available slot in that zone.
        slot = query.first() 
        
        if not slot:
            print(f"Backend: No available slot found for zone: {target_zone}") # NEW LOG
            return jsonify({'error': f'No available slots found for {vehicle_type} in Zone {target_zone}'}), 404
        
        print(f"Backend: Recommended slot found: {slot.to_dict()}") # NEW LOG
        return jsonify({
            'recommended_slot': slot.to_dict(),
            'navigation_info': {
                'level': slot.level,
                'zone': slot.zone,
                'slot_id': slot.slot_id
            }
        }), 200
        
    except Exception as e:
        print(f"Backend Error in /recommend: {str(e)}") # NEW LOG
        return jsonify({'error': str(e)}), 500

@bp.route('/occupy', methods=['POST'])
def occupy_slot():
    """Mark slot as occupied when vehicle enters"""
    try:
        data = request.get_json()
        slot_id = data.get('slot_id')
        vehicle_plate = data.get('vehiclePlate') # Get vehiclePlate
        entry_time = data.get('entryTime') # Get entryTime
        
        if not slot_id:
            return jsonify({'error': 'Slot ID required'}), 400
        
        slot = Slot.query.filter_by(slot_id=slot_id).first()
        
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        if not slot.status:
            return jsonify({'error': 'Slot already occupied'}), 400
        
        slot.status = False  # Mark as occupied (boolean False)
        slot.vehicle_plate = vehicle_plate # Store vehicle plate
        slot.entry_time = entry_time # Store entry time
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
        
        slot.status = True  # Mark as available (boolean True)
        slot.vehicle_plate = None # Clear vehicle plate on release
        slot.entry_time = None # Clear entry time on release
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
        
        total_slots = len(slots)
        available_slots_count = len([s for s in slots if s.status is True])
        occupied_slots_count = total_slots - available_slots_count
  
        occupied_slots = []
        available_slots = []
        
        for slot in slots:
            slot_data = slot.to_dict()
            
            if slot.status is False:  # Occupied
                # Add zone and plate info for occupied slots
                slot_data['zone'] = slot.zone
                slot_data['vehicle_plate'] = slot.vehicle_plate
                slot_data['entry_time'] = slot.entry_time.isoformat() if slot.entry_time else None
                occupied_slots.append(slot_data)
            else:  # Available
                available_slots.append(slot_data)
        
        # Group occupied slots by zone for better visualization
        occupied_by_zone = {}
        for slot in occupied_slots:
            zone = slot['zone']
            if zone not in occupied_by_zone:
                occupied_by_zone[zone] = []
            occupied_by_zone[zone].append(slot)
        
        return jsonify({
            'slots': [slot.to_dict() for slot in slots],
            'occupied_slots': occupied_slots,
            'available_slots': available_slots,
            'occupied_by_zone': occupied_by_zone,
            'statistics': {
                'total': total_slots,
                'available': available_slots_count,
                'occupied': occupied_slots_count,
                'occupied_by_zone': {
                    zone: len(slots_in_zone) 
                    for zone, slots_in_zone in occupied_by_zone.items()
                }
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
        
        if Slot.query.filter_by(slot_id=slot_id).first():
            return jsonify({'error': 'Slot ID already exists'}), 400
        
        slot = Slot(
            slot_id=slot_id,
            level=level,
            zone=zone,
            status=True # New slots are always available (boolean True)
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

@bp.route('/<int:slot_id_db>', methods=['PUT'])
@jwt_required()
def update_slot(slot_id_db):
    """Update slot - Admin Operator only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'operator']:
            return jsonify({'error': 'Admin & Operator access required'}), 403
        
        slot = Slot.query.get(slot_id_db) 
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
            incoming_status = data['status']
            if incoming_status == 'available':
                slot.status = True
            elif incoming_status == 'occupied':
                slot.status = False
            elif incoming_status == 'maintenance': 
                slot.status = False
            else:
                return jsonify({'error': 'Invalid status value provided'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Slot updated successfully',
            'slot': slot.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:slot_id_db>', methods=['DELETE'])
@jwt_required()
def delete_slot(slot_id_db):
    """Delete slot - Admin Operator only"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role not in ['admin', 'operator']:
            return jsonify({'error': 'Admin & Operator access required'}), 403
        
        slot = Slot.query.get(slot_id_db)
        if not slot:
            return jsonify({'error': 'Slot not found'}), 404
        
        db.session.delete(slot)
        db.session.commit()
        
        return jsonify({'message': 'Slot deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

