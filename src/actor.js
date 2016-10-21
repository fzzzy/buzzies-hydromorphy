
const Actors = (function () {
  let reviver = (k, v) => {
    console.log("revive", k, v);
    if (k === "from" && typeof v === "string" && v.startsWith("####address:")) {
      let addr = v.split(":");
      addr.shift();
      return new VatAddress(addr.join(":"));
    }
    return v;
  };

  let mailbox = new Map();
  let next_actor_id = 1;
  console.log("hello from the actor");

  window.addEventListener("message", (e) => {
    if (Object.getOwnPropertyNames(e.data).length === 2 &&
      e.data.pat !== undefined &&
      e.data.msg !== undefined
    ) {
      let match = mailbox.get(e.data.pat);
      if (match === undefined) {
        mailbox.set(e.data.pat, []);
      } else if (match instanceof Array) {
        console.log("MAILBOX GET", e.data.pat, mailbox.get(e.data.pat));
        match.push(e.data.msg);
      } else if (match instanceof Object) {
        match.resolve([e.data.pat, JSON.parse(e.data.msg, reviver)]);
        mailbox.delete(e.data.pat);
        console.log("OBJ");
      }
      console.log("CASTASDFASDFASDFASDFASDFEEEEEEE", e.data.pat, e.data.msg);
      let element = document.createElement("div");
      element.textContent = e.data.pat + ":" + e.data.msg;
      document.body.appendChild(element);
      console.log("PARSESD", JSON.parse(e.data.msg, reviver));
    }
    console.log("ACTOR MESSAGe", e);
  }, false);

  class VatAddress {
    constructor(actor_id) {
      this.actor_id = actor_id;
      this.next_msg_id = 1;
      this.outstanding_calls = new Map();
    }

    cast(pat, msg) {
      if (typeof pat !== "string") {
        throw new Error("pat argument must be a string");
      }
      parent.postMessage({actor: this.actor_id, pat, msg: JSON.stringify(msg)}, window.location.origin);
    }

    call(pat, msg) {
      const msg_id = this.next_msg_id++;
//      this.iframe.contentWindow.postMessage(JSON.stringify({msg_id, pat, msg}), "*");
      return new Promise((resolve, reject) => {
        this.outstanding_calls[msg_id] = [resolve, reject];
      });
    }

    toJSON() {
      return `####address:${this.actor_id}`;
    }
  }

  var query = {};
  var a = location.search.substr(1).split("&");
  for (var i = 0; i < a.length; i++) {
    var b = a[i].split("=");
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || "");
  }
  console.log("QUERY ACTOR", query);
  let actor = "hello";
  if (query.actor !== undefined) {
    actor = query.actor;
    if (actor.indexOf("/") !== -1 || actor.indexOf(".") !== -1) {
      throw new Error("Invalid actor name: " + actor);
    }
  }

  const script = document.createElement("script");
  script.src = `build/actors/${actor}.js`;
  document.body.appendChild(script);

  return new class Actors {
    spawn(actor_url, actor_name) {
      const actor_id = `actorid${next_actor_id++}`;
      if (actor_name !== undefined) {
        actor_id = `${actor_id}:actorname${actor_name}`;
      }
      parent.postMessage({
        spawn: actor_url,
        actor: actor_id
      }, window.location.origin);
      return new VatAddress(actor_id);
    }

    find(actor_name) {
      return new VatAddress(actor_name);
    }

    address() {
      return new VatAddress(window.actor_id);
    }

    recv(pattern) {
      return new Promise((resolve, reject) => {
        let matches = mailbox.get(pattern);
        if (matches instanceof Array) {
          console.log("it is an array", pattern);
          resolve(matches.shift());
          if (matches.length === 0) {
            mailbox.delete(pattern);
          }
        } else {
          console.log("it is not an array", pattern);
          mailbox.set(pattern, {resolve, reject});
        }
      });
    }
  }
})();

window.Actors = Actors;
