
/* globals Actors, React, ReactDOM  */

async function main() {
  const el = document.createElement("h1");
  el.textContent = "Server";
  document.body.appendChild(el);

  let [pat, msg] = await Actors.recv("named");
  if (msg && msg.from !== undefined) {
    msg.from.cast("serverresponse", {msg: "response from the server", from: Actors.address()});
  }
}

main();
