from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.order import Order
from models.product import Product
from models.user import User
from app import db
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    """Get analytics metrics (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Order metrics
        total_orders = Order.query.count()
        total_revenue = db.session.query(func.sum(Order.total_amount)).scalar() or 0
        pending_orders = Order.query.filter_by(status='pending').count()
        completed_orders = Order.query.filter_by(status='delivered').count()
        
        # Low stock products
        low_stock_products = Product.query.filter(
            Product.is_active == True,
            Product.stock_quantity <= 10
        ).count()
        
        return jsonify({
            'totalOrders': total_orders,
            'totalRevenue': float(total_revenue),
            'pendingOrders': pending_orders,
            'completedOrders': completed_orders,
            'lowStockCount': low_stock_products
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500