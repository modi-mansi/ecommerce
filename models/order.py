from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(__import__('uuid').uuid4()))
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    customer_name = db.Column(db.String(200), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, processing, shipped, delivered, cancelled
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_items=True):
        """Convert order to dictionary"""
        order_dict = {
            'id': self.id,
            'orderNumber': self.order_number,
            'customerId': self.customer_id,
            'customerName': self.customer_name,
            'customerEmail': self.customer_email,
            'status': self.status,
            'totalAmount': str(self.total_amount),
            'shippingAddress': self.shipping_address,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }
        
        if include_items:
            order_dict['items'] = [item.to_dict() for item in self.items]
        
        return order_dict
    
    def update_status(self, status):
        """Update order status"""
        self.status = status
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    @staticmethod
    def generate_order_number():
        """Generate unique order number"""
        from datetime import datetime
        date_str = datetime.now().strftime('%Y%m%d')
        # Get count of orders created today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_count = Order.query.filter(Order.created_at >= today_start).count()
        return f"ORD-{date_str}-{str(today_count + 1).zfill(3)}"
    
    def __repr__(self):
        return f'<Order {self.order_number}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(__import__('uuid').uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(200), nullable=False)
    product_sku = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    
    def to_dict(self):
        """Convert order item to dictionary"""
        return {
            'id': self.id,
            'orderId': self.order_id,
            'productId': self.product_id,
            'productName': self.product_name,
            'productSku': self.product_sku,
            'quantity': self.quantity,
            'unitPrice': str(self.unit_price),
            'totalPrice': str(self.total_price)
        }
    
    def __repr__(self):
        return f'<OrderItem {self.product_name} x{self.quantity}>'