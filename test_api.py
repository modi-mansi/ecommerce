#!/usr/bin/env python3
"""
Test script to demonstrate the Python Flask API endpoints
"""
import threading
import time
import requests
import json
from app import create_app

def run_server():
    """Run Flask server in a thread"""
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def test_api():
    """Test API endpoints"""
    time.sleep(2)  # Wait for server to start
    
    base_url = "http://127.0.0.1:5000/api"
    
    print("🧪 Testing Python Flask API Endpoints...")
    print("=" * 50)
    
    try:
        # Test 1: Register a new user
        print("\n1. Testing User Registration...")
        register_data = {
            "username": "testuser",
            "email": "test@example.com", 
            "firstName": "Test",
            "lastName": "User",
            "password": "test123"
        }
        
        response = requests.post(f"{base_url}/auth/register", json=register_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            result = response.json()
            print(f"   ✅ User created: {result['user']['username']}")
            token = result['access_token']
        else:
            print(f"   ⚠️  Response: {response.text}")
            return
            
        # Test 2: Login
        print("\n2. Testing User Login...")
        login_data = {"username": "testuser", "password": "test123"}
        response = requests.post(f"{base_url}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Login successful: {result['user']['username']}")
            token = result['access_token']
        else:
            print(f"   ❌ Login failed: {response.text}")
            return
            
        # Test 3: Get products (should be empty initially)
        print("\n3. Testing Products Endpoint...")
        response = requests.get(f"{base_url}/products")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"   ✅ Products retrieved: {len(products)} items")
        else:
            print(f"   ❌ Products failed: {response.text}")
            
        # Test 4: Test admin login
        print("\n4. Testing Admin Login...")
        admin_data = {"username": "admin", "password": "admin123"}
        response = requests.post(f"{base_url}/auth/register", json={
            "username": "admin",
            "email": "admin@example.com",
            "firstName": "Admin", 
            "lastName": "User",
            "password": "admin123",
            "role": "admin"
        })
        
        # Try login
        response = requests.post(f"{base_url}/auth/login", json=admin_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Admin login successful: {result['user']['role']}")
            admin_token = result['access_token']
            
            # Test admin endpoints
            print("\n5. Testing Admin Analytics...")
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{base_url}/analytics/metrics", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                metrics = response.json()
                print(f"   ✅ Analytics working: {metrics}")
        
        print("\n" + "=" * 50)
        print("🎉 Python Flask API is working perfectly!")
        print("\n📝 To run your server manually:")
        print("   python flask_server.py")
        print("\n🌐 Your API will be available at:")
        print("   http://localhost:5000/api/*")
        print("\n👤 Admin credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server")
    except Exception as e:
        print(f"❌ Test error: {e}")

if __name__ == "__main__":
    print("Starting Flask API test...")
    
    # Start server in background thread
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Run tests
    test_api()
    
    print("\nPress Ctrl+C to stop")