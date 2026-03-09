import os
import logging
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from models import db, User, Product, Order

from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
bcrypt = Bcrypt(app)

# Add POSTGRES_URI to your environment variables or use default
# Assuming local postgres instance with username 'postgres' and password 'postgres'
# Change these values according to your local DB setup
POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', 'postgres')
POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'localhost')
POSTGRES_DB = os.environ.get('POSTGRES_DB', 'ecommerce_db')
POSTGRES_PORT= os.environ.get('POSTGRES_PORT',5433 )

database_url = os.environ.get('DATABASE_URL')
if database_url:
    # Handle postgresql:// -> postgresql+pg8000:// if necessary
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'default-super-secret-key-change-in-prod')

db.init_app(app)
jwt = JWTManager(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Healthy"}), 200

# ----- AUTHENTICATION -----
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"message": "Name, email, and password are required"}), 400

    import re
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"message": "Invalid email format"}), 400
        
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User with this email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(name=name, email=email, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    logger.info(f"New user signed up: {email}")

    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    logger.info(f"User logged in: {email}")
    return jsonify({"access_token": access_token, "user": {"id": user.id, "name": user.name, "email": user.email}}), 200

# ----- PRODUCTS -----
@app.route('/api/products', methods=['GET'])
def list_products():
    products = Product.query.all()
    out = [{"id": p.id, "name": p.name, "description": p.description, "price": p.price} for p in products]
    return jsonify(out), 200

@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    description = data.get('description', '')

    if not all([name, price]):
        return jsonify({"message": "Product name and price are required"}), 400

    new_product = Product(name=name, price=price, description=description)
    db.session.add(new_product)
    db.session.commit()
    logger.info(f"Product added: {name}")

    return jsonify({"message": "Product created successfully", "id": new_product.id}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    data = request.get_json()
    product.name = data.get('name', product.name)
    product.price = data.get('price', product.price)
    product.description = data.get('description', product.description)

    db.session.commit()
    logger.info(f"Product updated: {product.name}")
    return jsonify({"message": "Product updated successfully"}), 200

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    logger.info(f"Product deleted ID: {product_id}")
    return jsonify({"message": "Product deleted successfully"}), 200

# ----- ORDERS -----
@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return jsonify({"message": "Product ID is required"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found"}), 404

    new_order = Order(user_id=user_id, product_id=product_id, quantity=quantity)
    db.session.add(new_order)
    db.session.commit()
    logger.info(f"Order placed: User {user_id} ordered Product {product_id}")

    return jsonify({"message": "Order created successfully", "order_id": new_order.id}), 201

@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    orders = Order.query.filter_by(user_id=user_id).all()
    out = []
    for o in orders:
        out.append({
            "id": o.id,
            "product_id": o.product_id,
            "product_name": o.product.name if o.product else "Unknown",
            "quantity": o.quantity,
            "order_date": o.order_date.isoformat(),
            "amount": o.quantity * (o.product.price if o.product else 0)
        })
    return jsonify(out), 200


if __name__ == '__main__':
    with app.app_context():
        # Ensure database is created (for local dev convenience)
        # Note: In production you would use schema migrations (e.g., Flask-Migrate)
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
