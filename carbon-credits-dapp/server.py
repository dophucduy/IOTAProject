#!/usr/bin/env python3
"""
Simple HTTP server for the Carbon Credits DApp
Run with: python server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌱 Carbon Credits DApp Server")
        print(f"📡 Serving at http://localhost:{PORT}")
        print(f"🔗 Contract: 0xd06181cdb4a44c6336ad0a94cf8aa555d29552def7486f578758dda630d9efe4")
        print(f"🌐 Network: IOTA Testnet")
        print(f"\n🚀 Opening browser...")
        
        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        
        print(f"💡 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()