/* globals Actors, React, ReactDOM  */

async function main() {
  console.log("HELO client");

  const el = document.createElement("h1");
  el.textContent = "Client";
  document.body.appendChild(el);

  const child = Actors.spawn("child");
  child.cast("test", {message: "hello whirled", from: Actors.address()});

  let [pat, msg] = await Actors.recv("response");
  console.log("RESPONSE", pat, msg);
  msg.from.cast("responseresponse", {msg: "ha!"});
}

main();
