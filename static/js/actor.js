
const {spawn, find} = (function () {
  let mailbox = new Map();
  let next_actor_id = 1;
  console.log("hello from the actor");

  window.addEventListener("message", (e) => {
    if (Object.getOwnPropertyNames(e.data).length === 2 &&
      e.data.pat !== undefined &&
      e.data.msg !== undefined
    ) {
      if (mailbox[e.data.pat] === undefined) {
        mailbox[e.data.pat] = [];
      }
      mailbox[e.data.pat].push(e.data.msg);
      console.log("CASTASDFASDFASDFASDFASDFEEEEEEE", e.data.pat, e.data.msg);
      let element = document.createElement("div");
      element.textContent = e.data.pat + ":" + e.data.msg;
      document.body.appendChild(element);
    }
    console.log("ACTOR MESSAGe", e);
  }, false);

  class RemoteAddress {
    constructor(actor_url) {
      this.next_msg_id = 1;
      this.outstanding_calls = new Map();
      this.actor_id = next_actor_id++;
      parent.postMessage({spawn: actor_url, actor: this.actor_id}, window.location.origin);
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
  script.src = `actors/${actor}.js`;
  document.body.appendChild(script);

  return {spawn: function spawn(actor_url) {
    return new RemoteAddress(actor_url);
  }, find: function find(actor_id) {
    return new Promise((resolve, reject) => {
      if (outstanding_finds[actor_id] === undefined) {
        outstanding_finds[actor_id] = [];
      }
      outstanding_finds[actor_id].push([resolve, reject]);
    });
  }};
})();
