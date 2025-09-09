#!/usr/bin/env python3
import os
import subprocess
import threading
import time
from app import create_app

def start_vite():
    """Start Vite dev server for React frontend"""
    time.sleep(2)  # Give Flask a moment to start
    subprocess.run(['npm', 'run', 'build'], cwd='/home/runner/workspace')

def main():
    # Start Flask backend
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    
    # Start Vite in a separate thread
    vite_thread = threading.Thread(target=start_vite)
    vite_thread.daemon = True
    vite_thread.start()
    
    # Run Flask app
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)

if __name__ == '__main__':
    main()