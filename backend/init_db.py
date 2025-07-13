#!/usr/bin/env python3
"""
Database initialization script
Run this to create tables and initial data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import create_app
from app.db.models import db, User, Slot, Payment

def init_database():
    """Initialize database with tables and default data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create default admin user
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                email='admin@parking.com',
                role='admin'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            print("Created default admin user: admin/admin123")
        
        # Create sample parking slots
        levels = ['L1', 'L2', 'L3']
        zones = ['A', 'B', 'C']
        
        for level in levels:
            for zone in zones:
                for slot_num in range(1, 11):  # 10 slots per zone
                    slot_id = f"{level}{zone}{slot_num:02d}"
                    
                    existing_slot = Slot.query.filter_by(slot_id=slot_id).first()
                    if not existing_slot:
                        slot = Slot(
                            slot_id=slot_id,
                            level=level,
                            zone=zone,
                            status=True  # Available
                        )
                        db.session.add(slot)
        
        db.session.commit()
        print("Database initialized successfully!")
        print("Created sample parking slots (L1-L3, Zones A-C, 10 slots each)")
        print("Total slots created: 120")

if __name__ == '__main__':
    init_database()