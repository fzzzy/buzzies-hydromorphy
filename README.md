
Buzzies Hydromorphy
===================

A distributed Actor system built on top of ES6 with a little ES.next (async await)

Requires:

- python3
- selenium
- chromedriver

- docker (optional)

Quickstart:
-----------

- Install chromedriver on your path.
- `pip3 install selenium eventlet flask flask_socketio`
- `python3 run.py`

Running under docker:
---------------------

- `./run-docker`

Operation
---------

The `index.html` file inside the `static/server` directory is loaded in a headless chrome instance on the server. The `index.html` file inside the `static/client` directory is served on port `5000` and can be loaded in a web browser on <http://localhost:5000>.
