/* globals address, find, recv, spawn  */

async function main() {
  console.log("HELO child");

  const el = document.createElement("h1");
  el.textContent = "Child";
  document.body.appendChild(el);

  const server = find("server");

  server.cast("named", {"named": "cast", from: address()});

  let [pat, msg] = await recv("test");
  console.log("GOT testMESSG", pat, msg);
  msg.from.cast("response", {msg: "it works!", from: address()});
}

main();
