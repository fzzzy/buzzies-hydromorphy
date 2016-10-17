console.log("HELO SERVER");

const el = document.createElement("h1");
el.textContent = "Server";
document.body.appendChild(el);

recv("named").then(([pat, msg]) => {
  if (msg && msg.from !== undefined) {
    msg.from.cast("serverresponse", {msg: "response from the server"});
  }
});
