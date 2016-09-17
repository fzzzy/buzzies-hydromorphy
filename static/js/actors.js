
const spawn = (function () {
  class Vat {
    constructor() {
      this.next_actor_id = 1;
      window.addEventListener((e) => {
        console.log("VAT EVENT", e);
      }, false);
    }

    spawn(actor_url, actor_name) {
      let actor_id;
      if (actor_name !== undefined) {
        if (this[actor_name] !== undefined) {
          throw new Error("Name already in use");
        }
        actor_id = actor_name;
      } else {
        actor_id = this.next_actor_id++;
      }
      this[actor_id] = new Address(actor_url);
    }

    find(actor_name) {
      return this[actor_name];
    }
  }

  const vat = new Vat();

  class Address {
    constructor(actor_url, actor_id) {
      this.next_msg_id = 1;
      this.outstanding_calls = new Map();
      this.iframe = document.createElement("iframe");
      this.iframe.src = actor_url;
      this.actor_id = actor_id;
      document.body.appendChild(this.iframe);
    }

    cast(pat, msg) {
      this.iframe.contentWindow.postMessage(JSON.stringify({pat, msg}), "*");
    }

    call(pat, msg) {
      const msg_id = this.next_msg_id++;
      this.iframe.contentWindow.postMessage(JSON.stringify({msg_id, pat, msg}), "*");
      return new Promise((resolve, reject) => {
        this.outstanding_calls[msg_id] = [resolve, reject];
      });
    }

    toJSON() {
      return `####address:${this.actor_id}`;
    }
  }

  return function spawn(actor_url) {
    return new Address(actor_url);
  }
})();
