/* globals Actors  */

async function main() {
  console.log("HELO child");

  const el = document.createElement("h1");
  el.textContent = "Child";
  document.body.appendChild(el);

  const server = Actors.find("server");

  server.cast("named", {"named": "cast", from: Actors.address()});

  let [pat, msg] = await Actors.recv("test");
  console.log("GOT testMESSG", pat, msg);
  msg.from.cast("response", {msg: "it works!", from: Actors.address()});
}

main();
