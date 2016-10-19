
/* globals address, find, recv, spawn  */

async function main() {
  console.log("HELO SERVER");
  debugger;
  const el = document.createElement("h1");
  el.textContent = "Server";
  document.body.appendChild(el);

  let [pat, msg] = await recv("named");
  if (msg && msg.from !== undefined) {
    msg.from.cast("serverresponse", {msg: "response from the server"});
  }
}

main();
