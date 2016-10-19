/* globals address, find, recv, spawn  */

async function main() {
  console.log("HELO client");

  const el = document.createElement("h1");
  el.textContent = "Client";
  document.body.appendChild(el);

  const child = spawn("child");
  child.cast("test", {message: "hello whirled", from: address()});

  let [pat, msg] = await recv("response");
  console.log("RESPONSE", pat, msg);
  msg.from.cast("responseresponse", {msg: "ha!"});
}

main();
