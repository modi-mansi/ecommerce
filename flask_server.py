#!/usr/bin/env python3
"""
Main Flask server entry point
"""
from app import create_app, db
from models.user import User
from models.product import Product
from decimal import Decimal
import os

def create_sample_data():
    """Create sample data for testing"""
    # Create admin user
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
    
    # Create sample customer
    customer = User.query.filter_by(username='customer').first()
    if not customer:
        customer = User(
            username='customer',
            email='customer@example.com',
            first_name='John',
            last_name='Doe',
            role='customer'
        )
        customer.set_password('customer123')
        db.session.add(customer)
    
    # Create sample products
    products_data = [
        {
            'name': 'Premium Wireless Headphones',
            'description': 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.',
            'sku': 'HP-001',
            'price': Decimal('299.99'),
            'original_price': Decimal('399.99'),
            'stock_quantity': 15,
            'category': 'Electronics',
            'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            'rating': Decimal('4.8')
        },
        {
            'name': 'Professional Laptop Pro',
            'description': 'High-performance laptop with 16GB RAM, 512GB SSD, and Intel i7 processor for professional work.',
            'sku': 'LP-002',
            'price': Decimal('1299.99'),
            'stock_quantity': 8,
            'category': 'Electronics',
            'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            'rating': Decimal('4.9')
        },
        {
            'name': 'Athletic Running Shoes',
            'description': 'Lightweight running shoes with advanced cushioning and breathable mesh upper.',
            'sku': 'SH-003',
            'price': Decimal('129.99'),
            'original_price': Decimal('159.99'),
            'stock_quantity': 3,
            'category': 'Sports',
            'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            'rating': Decimal('4.7')
        },
        {
            'name': 'Smartphone Pro Max',
            'description': 'Latest smartphone with advanced camera system, 5G connectivity, and all-day battery life.',
            'sku': 'SP-004',
            'price': Decimal('899.99'),
            'stock_quantity': 0,
            'category': 'Electronics',
            'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            'rating': Decimal('4.6')
        }
    ]
    
    for product_data in products_data:
        existing_product = Product.query.filter_by(sku=product_data['sku']).first()
        if not existing_product:
            product = Product(**product_data)
            db.session.add(product)
    
    db.session.commit()
    print("✅ Sample data created successfully!")

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create sample data
        create_sample_data()
    
    print("🚀 Starting Flask server...")
    print("📝 Admin credentials: admin / admin123")
    print("👤 Customer credentials: customer / customer123")
    print("🌐 API available at: http://localhost:5000/api/*")
    
    # Run the app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)