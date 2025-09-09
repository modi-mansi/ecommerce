from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(__import__('uuid').uuid4()))
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2), nullable=True)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    category = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Numeric(2, 1), default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    cart_items = db.relationship('CartItem', backref='product', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert product to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'sku': self.sku,
            'price': str(self.price),
            'originalPrice': str(self.original_price) if self.original_price else None,
            'stockQuantity': self.stock_quantity,
            'category': self.category,
            'imageUrl': self.image_url,
            'rating': str(self.rating),
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
    
    def update_stock(self, quantity):
        """Update stock quantity"""
        self.stock_quantity = quantity
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def is_low_stock(self, threshold=10):
        """Check if product is low stock"""
        return self.stock_quantity <= threshold and self.stock_quantity > 0
    
    def is_out_of_stock(self):
        """Check if product is out of stock"""
        return self.stock_quantity == 0
    
    def __repr__(self):
        return f'<Product {self.name}>'