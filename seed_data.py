from app import create_app, db
from models.user import User
from models.product import Product

def seed_data():
    app = create_app()
    with app.app_context():
        # Create admin user
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User()
            admin.username = 'admin'
            admin.email = 'admin@example.com'
            admin.first_name = 'Admin'
            admin.last_name = 'User'
            admin.role = 'admin'
            admin.set_password('admin123')
            db.session.add(admin)
        
        # Create sample products
        products_data = [
            {
                'name': 'Premium Wireless Headphones',
                'description': 'High-quality wireless headphones with noise cancellation',
                'sku': 'WH-001',
                'price': '299.99',
                'original_price': '399.99',
                'stock_quantity': 50,
                'category': 'Electronics',
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                'rating': '4.5'
            },
            {
                'name': 'Smartphone Pro Max',
                'description': 'Latest flagship smartphone with advanced features',
                'sku': 'SP-001',
                'price': '999.99',
                'stock_quantity': 25,
                'category': 'Electronics',
                'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
                'rating': '4.8'
            },
            {
                'name': 'Gaming Laptop Ultra',
                'description': 'High-performance gaming laptop with RTX graphics',
                'sku': 'GL-001',
                'price': '1499.99',
                'stock_quantity': 15,
                'category': 'Electronics',
                'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                'rating': '4.6'
            },
            {
                'name': 'Ergonomic Office Chair',
                'description': 'Comfortable office chair with lumbar support',
                'sku': 'OC-001',
                'price': '299.99',
                'stock_quantity': 30,
                'category': 'Furniture',
                'image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
                'rating': '4.3'
            },
            {
                'name': 'Standing Desk',
                'description': 'Adjustable height standing desk for healthy work',
                'sku': 'SD-001',
                'price': '449.99',
                'stock_quantity': 20,
                'category': 'Furniture',
                'image_url': 'https://images.unsplash.com/photo-1544717342-6833ad31d8ea?w=400',
                'rating': '4.4'
            },
            {
                'name': 'Organic Cotton T-Shirt',
                'description': 'Comfortable organic cotton t-shirt',
                'sku': 'TS-001',
                'price': '29.99',
                'stock_quantity': 100,
                'category': 'Clothing',
                'image_url': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                'rating': '4.2'
            }
        ]
        
        for product_data in products_data:
            existing_product = Product.query.filter_by(sku=product_data['sku']).first()
            if not existing_product:
                product = Product()
                for key, value in product_data.items():
                    setattr(product, key, value)
                db.session.add(product)
        
        db.session.commit()
        print("Seed data created successfully!")

if __name__ == '__main__':
    seed_data()