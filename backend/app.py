from sanic import Sanic, response
from sanic.exceptions import SanicException
from sanic_cors import CORS

from config import PORT
from database import init_db_pool, close_db_pool
from routes.auth_routes import auth_bp
from routes.request_routes import requests_bp

app = Sanic("ApartmentMaintenance")
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_listener(init_db_pool, "before_server_start")
app.register_listener(close_db_pool, "after_server_stop")

app.blueprint(auth_bp)
app.blueprint(requests_bp)


@app.exception(SanicException)
async def handle_sanic_exception(request, exc):
    return response.json({"error": str(exc)}, status=exc.status_code)


@app.exception(Exception)
async def handle_generic_exception(request, exc):
    return response.json({"error": "Internal server error"}, status=500)


@app.get("/health")
async def health(request):
    return response.json({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, dev=True)
