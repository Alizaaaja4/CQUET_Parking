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

def init_database(drop_existing=False):
    """Initialize database with tables and default data"""
    app = create_app()
    with app.app_context():
        if drop_existing:
            print("Dropping existing tables...")
            db.drop_all()
        
        # Create all tables (including new fields)
        print("Creating tables...")
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
        
        # Create default operator user
        operator_user = User.query.filter_by(username='operator').first()
        if not operator_user:
            operator_user = User(
                username='operator',
                email='operator@parking.com',
                role='operator'
            )
            operator_user.set_password('operator123')
            db.session.add(operator_user)
            print("Created default operator user: operator/operator123")
        
        # Commit users to database first
        db.session.commit()

        # Create sample parking slots with new fields
        level_zone_slots = {
            'L1': {'A': 10},  # Bike zone
            'L2': {'B': 20},  # Car zone
            'L3': {'C': 30}   # Heavy vehicle zone
        }

        for level, zones in level_zone_slots.items():
            for zone, num_slots in zones.items():
                for slot_num in range(1, num_slots + 1):
                    slot_id = f"{level}{zone}{slot_num:02d}"
                    existing_slot = Slot.query.filter_by(slot_id=slot_id).first()
                    if not existing_slot:
                        slot = Slot(
                            slot_id=slot_id,
                            level=level,
                            zone=zone,
                            status=True,  # Available
                            vehicle_plate=None,  # No vehicle initially
                            entry_time=None      # No entry time initially
                        )
                        db.session.add(slot)
        
        db.session.commit()
        print(f"Created sample parking slots")
        
        # Print summary
        total_slots = Slot.query.count()
        total_users = User.query.count()
        print(f"\nDatabase initialized successfully!")
        print(f"Total users: {total_users}")
        print(f"Total slots: {total_slots}")

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Initialize database')
    parser.add_argument('--drop', action='store_true', 
                       help='Drop existing tables before creating new ones')
    args = parser.parse_args()
    
    init_database(drop_existing=args.drop)