"""
Локальный сервер для сайта-портфолио.
Запуск: python server.py
Открывает http://localhost:3000
"""

import http.server
import socketserver
import webbrowser

PORT = 3000

class PortfolioHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), PortfolioHandler) as httpd:
        print(f"🚀 Сайт-портфолио запущен: http://localhost:{PORT}")
        webbrowser.open(f"http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")
