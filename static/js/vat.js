
(function () {
  const socket = io();
  socket.on("msg", (msg) => {
    console.log("msg", msg);
  });

  socket.on("named", (msg) => {
    const target = vat.actors[msg.actor];
    if (target !== undefined) {
      target.cast(msg.pat, msg.msg);
    } else {
      console.warn("Ignored named message with unknown name", msg, vat.actors);
    }
  })

  class Vat {
    constructor() {
      this.actors = new Map();
      this.next_actor_id = 1;
      window.addEventListener("message", (e) => {
        if (e.origin !== window.location.origin) {
          console.error("message from unacceptable origin:", e.origin, "should be:", window.location.origin);
        }
        if (Object.getOwnPropertyNames(e.data).length === 2 &&
          e.data.actor !== undefined &&
          e.data.spawn !== undefined
        ) {
          console.log("VAT SPAWN", e.data);
          console.log("aid", e.source.actor_id);
          if (e.source.actor_id === undefined) {
            return this.spawn(e.data.spawn, e.data.actor);
          } else {
            return this.spawn(e.data.spawn, `${e.source.actor_id}:${e.data.actor}`);
          }
        } else if (Object.getOwnPropertyNames(e.data).length === 3 &&
          e.data.actor !== undefined &&
          e.data.pat !== undefined &&
          e.data.msg !== undefined
        ) {
          const act = this.find(`${e.source.actor_id}:${e.data.actor}`);
          if (act !== undefined) {
            act.cast(e.data.pat, e.data.msg);
          } else {
            console.log("NO ACTOR FOUND FOR", e.data.actor);
            socket.emit("named", e.data);
            // TODO send message to socket.io here
          }
          console.log("CASSSST");
        }
        console.log("VAT EVENT", e);
      }, false);
    }

    spawn(actor, actor_name) {
      let actor_id;
      if (typeof actor_name === "number") {

      } else if (actor_name !== undefined) {
        if (this.actors[actor_name] !== undefined) {
          throw new Error("Name already in use");
        }
        actor_id = actor_name;
        socket.emit("register", actor_name);
      } else {
        actor_id = this.next_actor_id++;
      }
      this.actors[actor_id] = new Address(actor, actor_id);
    }

    find(actor_name) {
      return this.actors[actor_name];
    }
  }

  class Address {
    constructor(actor, actor_id) {
      this.next_msg_id = 1;
      this.outstanding_calls = new Map();
      this.iframe = document.createElement("iframe");
      this.iframe.src = `actor.html?actor=${encodeURIComponent(actor)}`;
      this.actor_id = actor_id;
      this.buffer = [];
      document.body.appendChild(this.iframe);
      this.iframe.addEventListener("load", () => {
        const buffer = this.buffer;
        delete this.buffer;

        this.iframe.contentWindow.actor_id = this.actor_id;
        console.log("load set actor id", this.iframe.contentWindow.actor_id, this.actor_id);

        for (const [pat, msg] of buffer) {
          this.cast(pat, msg);
        }
      }, false);
    }

    cast(pat, msg) {
      if (this.buffer !== undefined) {
        this.buffer.push([pat, msg]);
      } else {
        this.iframe.contentWindow.postMessage({
          pat,
          msg: msg},
        "*");
      }
      console.log("cast", pat, msg);
    }

    call(pat, msg) {
      const msg_id = this.next_msg_id++;
      this.iframe.contentWindow.postMessage({msg_id, pat, msg: msg}, "*");
      return new Promise((resolve, reject) => {
        this.outstanding_calls[msg_id] = [resolve, reject];
      });
    }

    toJSON() {
      return `####address:${this.actor_id}`;
    }
  }

  const vat = new Vat();

  var query = {};
  var a = location.search.substr(1).split("&");
  for (var i = 0; i < a.length; i++) {
    var b = a[i].split("=");
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || "");
  }
  console.log("QUERY", query);
  let actor = "dead";
  if (query.actor !== undefined) {
    actor = query.actor;
    if (actor.indexOf("/") !== -1 || actor.indexOf(".") !== -1) {
      throw new Error("Invalid actor name:", actor);
    }
  }

  vat.spawn(actor, query.name);

})();
