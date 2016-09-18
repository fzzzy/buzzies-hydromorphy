console.log("HELO child");

const el = document.createElement("h1");
el.textContent = "Child";
document.body.appendChild(el);

const server = find("server");

server.cast("named", {"named": "cast"});
