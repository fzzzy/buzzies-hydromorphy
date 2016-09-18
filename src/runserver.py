
import json
import os
import signal
import sys

import flask
import flask_socketio

print("server", os.getcwd())

finalized = False

def finalize():
    global finalized
    if finalized:
        return

    sys.stdout.flush()
    try:
        os.unlink("server.pid")
    except FileNotFoundError:
        print("Could not unlink server.pid: File not found")
    finalized = True

def signal_term_handler(signal, frame):
    print("got SIGTERM")
    finalize()
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_term_handler)

print("writing pid")
with open("server.pid", "w") as pid:
    pid.write(str(os.getpid()))
print("wrote pid")

app = flask.Flask(__name__)
socketio = flask_socketio.SocketIO(app)

@app.route("/<path:path>")
def send_static(path):
    print("send static", path)
    return flask.send_from_directory("static", path)

@app.route("/")
def send_home():
    print("send static index.html")
    return flask.send_from_directory("static", "index.html")

@app.route("/favicon.ico")
def send_favicon():
    return "ok"

@socketio.on("msg")
def handle_msg(message):
    print("message", message)
    socketio.emit("msg", "echo " + message)

@socketio.on("register")
def handle_register(message):
    print("JOIN ROOM", message)
    flask_socketio.join_room(message)
    print("register", message)

@socketio.on("named")
def handle_named(message):
    flask_socketio.emit("named", message, room=message["actor"])
    print("named", message["actor"])

def serve():
    print("Server listening on 5000")
    socketio.run(app)

if __name__ == "__main__":
    serve()
    print("done serving")
    finalize()
