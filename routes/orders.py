from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from models.cart import CartItem
from app import db
from decimal import Decimal

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """Get orders with optional filtering"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        status = request.args.get('status')
        customer_id = request.args.get('customerId')
        
        if current_user.role == 'admin':
            # Admin can see all orders
            query = Order.query
            
            if status:
                query = query.filter_by(status=status)
            if customer_id:
                query = query.filter_by(customer_id=customer_id)
        else:
            # Regular users can only see their own orders
            query = Order.query.filter_by(customer_id=current_user_id)
            
            if status:
                query = query.filter_by(status=status)
        
        orders = query.order_by(Order.created_at.desc()).all()
        return jsonify([order.to_dict() for order in orders]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get specific order"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Users can only see their own orders, admins can see all
        if current_user.role != 'admin' and order.customer_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/number/<order_number>', methods=['GET'])
@jwt_required()
def get_order_by_number(order_number):
    """Get order by order number"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        order = Order.query.filter_by(order_number=order_number).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Users can only see their own orders, admins can see all
        if current_user.role != 'admin' and order.customer_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create new order"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        data = request.get_json()
        order_data = data.get('order')
        items_data = data.get('items')
        
        if not order_data or not items_data:
            return jsonify({'error': 'Order and items data required'}), 400
        
        if not isinstance(items_data, list) or len(items_data) == 0:
            return jsonify({'error': 'Order must contain at least one item'}), 400
        
        # Validate and calculate total
        total_amount = Decimal('0')
        validated_items = []
        
        for item in items_data:
            product = Product.query.get(item.get('productId'))
            if not product or not product.is_active:
                return jsonify({'error': f'Product {item.get("productId")} not found'}), 400
            
            quantity = item.get('quantity', 1)
            if quantity <= 0:
                return jsonify({'error': 'Invalid quantity'}), 400
            
            if product.stock_quantity < quantity:
                return jsonify({'error': f'Insufficient stock for {product.name}'}), 400
            
            item_total = product.price * quantity
            total_amount += item_total
            
            validated_items.append({
                'product': product,
                'quantity': quantity,
                'unit_price': product.price,
                'total_price': item_total
            })
        
        # Create order
        order = Order(
            order_number=Order.generate_order_number(),
            customer_id=current_user_id,
            customer_name=f"{current_user.first_name} {current_user.last_name}",
            customer_email=current_user.email,
            status=order_data.get('status', 'pending'),
            total_amount=total_amount,
            shipping_address=order_data['shippingAddress']
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        # Create order items and update stock
        for item_data in validated_items:
            product = item_data['product']
            
            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                total_price=item_data['total_price']
            )
            
            db.session.add(order_item)
            
            # Update product stock
            product.stock_quantity -= item_data['quantity']
        
        # Clear user's cart if specified
        if data.get('clearCart', False):
            CartItem.query.filter_by(user_id=current_user_id).delete()
        
        db.session.commit()
        
        return jsonify(order.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """Update order status (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        order.update_status(status)
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/<order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    """Cancel order"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Users can only cancel their own orders, admins can cancel any
        if current_user.role != 'admin' and order.customer_id != current_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        if order.status in ['delivered', 'cancelled']:
            return jsonify({'error': 'Cannot cancel this order'}), 400
        
        # Restore stock for cancelled orders
        if order.status in ['pending', 'processing']:
            for item in order.items:
                product = Product.query.get(item.product_id)
                if product:
                    product.stock_quantity += item.quantity
        
        order.update_status('cancelled')
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500