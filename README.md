
Buzzies Hydromorphy
===================

A distributed Actor system built on top of ES6 with a little ES.next (async await)

Requires:

- python3
- node > 6
- chromedriver
- docker (optional)

Quickstart:
-----------

- Install chromedriver on your path.
- `npm run start`

Running under docker:
---------------------

- `./run-docker`

Operation
---------

When using `npm run start`, selenium creates a chrome instance and loads two tabs, one with the client.js actor and one with the server.js actor. There should be messages in the `client` and `child` iframes, as well as in the other tab in the `server` iframe.

When running under docker, the `static/server.html` file is loaded in a headless chrome instance on the server. The `static/client.html` file is served on port `5000` and is loaded in Chrome on <http://localhost:5000>.
