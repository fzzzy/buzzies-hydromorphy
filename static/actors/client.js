console.log("HELO client");

const el = document.createElement("h1");
el.textContent = "Client";
document.body.appendChild(el);

const child = spawn("child");
child.cast("test", {message: "hello whirled"});
