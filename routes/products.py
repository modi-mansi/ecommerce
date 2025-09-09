from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.product import Product
from models.user import User
from app import db
from decimal import Decimal

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    try:
        category = request.args.get('category')
        search = request.args.get('search')
        in_stock = request.args.get('inStock')
        
        query = Product.query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        if search:
            query = query.filter(
                db.or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.description.ilike(f'%{search}%'),
                    Product.category.ilike(f'%{search}%')
                )
            )
        
        if in_stock == 'true':
            query = query.filter(Product.stock_quantity > 0)
        
        products = query.all()
        return jsonify([product.to_dict() for product in products]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get specific product"""
    try:
        product = Product.query.get(product_id)
        if not product or not product.is_active:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Create new product (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'description', 'sku', 'price', 'category', 'imageUrl']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if SKU already exists
        if Product.query.filter_by(sku=data['sku']).first():
            return jsonify({'error': 'SKU already exists'}), 409
        
        # Create product
        product = Product(
            name=data['name'],
            description=data['description'],
            sku=data['sku'],
            price=Decimal(str(data['price'])),
            original_price=Decimal(str(data['originalPrice'])) if data.get('originalPrice') else None,
            stock_quantity=data.get('stockQuantity', 0),
            category=data['category'],
            image_url=data['imageUrl'],
            rating=Decimal(str(data.get('rating', 0)))
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update product (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = Decimal(str(data['price']))
        if 'originalPrice' in data:
            product.original_price = Decimal(str(data['originalPrice'])) if data['originalPrice'] else None
        if 'stockQuantity' in data:
            product.stock_quantity = data['stockQuantity']
        if 'category' in data:
            product.category = data['category']
        if 'imageUrl' in data:
            product.image_url = data['imageUrl']
        if 'rating' in data:
            product.rating = Decimal(str(data['rating']))
        if 'isActive' in data:
            product.is_active = data['isActive']
        
        db.session.commit()
        
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>/stock', methods=['PUT'])
@jwt_required()
def update_product_stock(product_id):
    """Update product stock (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.get_json()
        quantity = data.get('quantity')
        
        if quantity is None or quantity < 0:
            return jsonify({'error': 'Invalid quantity'}), 400
        
        product.update_stock(quantity)
        
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock_products():
    """Get low stock products (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        threshold = int(request.args.get('threshold', 10))
        products = Product.query.filter(
            Product.is_active == True,
            Product.stock_quantity <= threshold
        ).all()
        
        result = []
        for product in products:
            product_dict = product.to_dict()
            product_dict['lowStock'] = product.is_low_stock(threshold)
            product_dict['outOfStock'] = product.is_out_of_stock()
            result.append(product_dict)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500