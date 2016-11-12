

import React from 'react';
import ReactDOM from 'react-dom';

(function () {
  let appendCard;

  class Stack extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        cards: []
      };
      appendCard = this.append.bind(this);
    }

    render() {
      let opts = this.state.cards.map(({id}) => {
        return <option key={ id }>{ id }</option>;
      });
      return <div>
        <select>
          { opts }
        </select>
      </div>;
    }

    append(id, iframe) {
      const newCards =  this.state.cards.concat([{id, iframe}]);
      this.setState({cards: newCards});
    }
  }

  ReactDOM.render(<Stack />, document.getElementById("root"));

  const client = require("socket.io-client");
  const socket = client();
  socket.on("msg", (msg) => {
    console.log("msg", msg);
  });

  socket.on("named", (msg) => {
    const target = vat.actors.get(msg.actor);
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
        const datalen = Object.getOwnPropertyNames(e.data).length;
        if (datalen === 3 &&
          e.data.actor !== undefined &&
          e.data.spawn !== undefined &&
          e.data.background !== undefined) {
          if (e.source.actor_id === undefined) {
            return this.spawn(
              e.data.spawn,
              {actor_name: e.data.actor, background: e.data.background}
            );
          } else {
            const actor_name = `${e.source.actor_id}:${e.data.actor}`;
            return this.spawn(
              e.data.spawn,
              {actor_name, background: e.data.background}
            );
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
            const act2 = this.find(e.data.actor);
            if (act2 !== undefined) {
              act2.cast(e.data.pat, e.data.msg);
            } else {
              socket.emit("named", e.data);
            }
          }
        }
      }, false);
    }

    spawn(actor, {actor_name, background=false}) {
      let actor_id;
      if (typeof actor_name === "number") {
        console.error("IT IS A NUMBER", actor_name);
      } else if (actor_name !== undefined) {
        if (this.actors.get(actor_name) !== undefined) {
          throw new Error("Name already in use");
        }
        actor_id = actor_name;
      } else {
        actor_id = this.next_actor_id++;
      }
      socket.emit("register", actor_id);
      this.actors.set(`${actor_id}`, new Address(
        actor, {actor_name: actor_id, background: background}));
    }

    find(actor_name) {
      return this.actors.get(actor_name);
    }
  }

  class Address {
    constructor(actor, {actor_name, background=false}) {
      this.next_msg_id = 1;
      this.outstanding_calls = new Map();
      this.iframe = document.createElement("iframe");
      this.iframe.style.position = "absolute";
      this.iframe.style.top = "4px";
      this.iframe.style.right = "4px";
      this.iframe.setAttribute("width", "512");
      this.iframe.setAttribute("height", "384");
      this.iframe.src = `actor.html?actor=${encodeURIComponent(actor)}`;
      this.actor_id = actor_name;
      appendCard(this.actor_id, this.iframe);
      this.buffer = [];
      if (background) {
        document.body.insertBefore(this.iframe, document.body.lastChild);
      } else {
        document.body.appendChild(this.iframe);
      }
      this.iframe.contentWindow.actor_id = this.actor_id;
      this.iframe.addEventListener("load", () => {
        const buffer = this.buffer;
        delete this.buffer;

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
  let actor = "dead";
  if (query.actor !== undefined) {
    actor = query.actor;
    if (actor.indexOf("/") !== -1 || actor.indexOf(".") !== -1) {
      throw new Error("Invalid actor name:", actor);
    }
  }

  vat.spawn(actor, {actor_name: query.name});
})();
