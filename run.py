#!/usr/bin/env python3
import os
from app import create_app
from flask import send_from_directory

def create_full_app():
    app = create_app()
    
    # Serve React build files
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path != "" and os.path.exists(f"client/dist/{path}"):
            return send_from_directory('client/dist', path)
        else:
            return send_from_directory('client/dist', 'index.html')
    
    return app

if __name__ == '__main__':
    app = create_full_app()
    
    # Bind to 0.0.0.0:5000 as required
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)