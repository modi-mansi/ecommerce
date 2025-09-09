from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.cart import CartItem
from models.product import Product
from models.user import User
from app import db

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_cart_items(user_id):
    """Get cart items for a user"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Users can only access their own cart, admins can access any cart
        if current_user.role != 'admin' and current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        return jsonify([item.to_dict() for item in cart_items]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add item to cart"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        user_id = data.get('userId')
        product_id = data.get('productId')
        quantity = data.get('quantity', 1)
        
        # Users can only add to their own cart
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        if not product_id:
            return jsonify({'error': 'Product ID is required'}), 400
        
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be positive'}), 400
        
        # Check if product exists
        product = Product.query.get(product_id)
        if not product or not product.is_active:
            return jsonify({'error': 'Product not found'}), 404
        
        # Check if item already in cart
        existing_item = CartItem.query.filter_by(
            user_id=user_id,
            product_id=product_id
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
            db.session.commit()
            return jsonify(existing_item.to_dict()), 200
        else:
            cart_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
            db.session.commit()
            return jsonify(cart_item.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<user_id>/<product_id>', methods=['PUT'])
@jwt_required()
def update_cart_quantity(user_id, product_id):
    """Update cart item quantity"""
    try:
        current_user_id = get_jwt_identity()
        
        # Users can only update their own cart
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        quantity = data.get('quantity')
        
        if quantity is None or quantity <= 0:
            return jsonify({'error': 'Invalid quantity'}), 400
        
        cart_item = CartItem.query.filter_by(
            user_id=user_id,
            product_id=product_id
        ).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        cart_item.quantity = quantity
        db.session.commit()
        
        return jsonify(cart_item.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<user_id>/<product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(user_id, product_id):
    """Remove item from cart"""
    try:
        current_user_id = get_jwt_identity()
        
        # Users can only remove from their own cart
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        cart_item = CartItem.query.filter_by(
            user_id=user_id,
            product_id=product_id
        ).first()
        
        if not cart_item:
            return jsonify({'error': 'Cart item not found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/<user_id>', methods=['DELETE'])
@jwt_required()
def clear_cart(user_id):
    """Clear all items from cart"""
    try:
        current_user_id = get_jwt_identity()
        
        # Users can only clear their own cart
        if current_user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        CartItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500