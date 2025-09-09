from app import db
from datetime import datetime

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(__import__('uuid').uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self, include_product=True):
        """Convert cart item to dictionary"""
        cart_dict = {
            'id': self.id,
            'userId': self.user_id,
            'productId': self.product_id,
            'quantity': self.quantity,
            'createdAt': self.created_at.isoformat()
        }
        
        if include_product and self.product:
            cart_dict['product'] = self.product.to_dict()
        
        return cart_dict
    
    def __repr__(self):
        return f'<CartItem {self.product.name if self.product else self.product_id} x{self.quantity}>'