/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

let controller = null;
let entities = [];

function render() {
  ReactDOM.render(
    <HelloWorld entities={ entities } />,
    document.getElementById("root"));
}

class HelloWorld extends React.Component {
  *generateEntities() {
    let i = 0;
    for (let ent of entities) {
      let val = null;
      if (ent.action === "text") {
        val = ent.state;
      } else if (ent.action === "image") {
        val = <img src={ ent.state } />;
      } else if (ent.action === "emoji") {
        val = <span style={{
          whiteSpace: "nowrap",
          fontSize: "128px"
        }}>
          { ent.state }
        </span>;
      } else {
        val = ent.action;
      }
      yield <div style={{
        position: "absolute",
        top: `${ ent.y }px`,
        left: `${ ent.x }px`,
      }} key={ i++ }>{ val }</div>;
    }
  }

  render() {
    return <div style={{
      overflow: "hidden"
    }}>
      { Array.from(this.generateEntities() )}
    </div>;
  }
}

class Controller {
  constructor(parent) {
    this.parent = parent;
  }

  commit() {
    this.parent.cast("commit", {});
  }

  action({action}) {
    render();
  }

  add(obj) {
    entities.push(obj);
    render();
  }
}

async function main() {
  console.log("HELO child");

  let [pat, msg] = await Actors.recv("hello");

  console.log("GOT testMESSG", pat, msg);
  msg.from.cast("response", {msg: "it works!", from: Actors.address()});

  controller = new Controller(msg.from);

  render();

  const server = Actors.find("server");

  server.cast("named", {"named": "cast", from: Actors.address()});

  while (true) {
    let [pat, msg] = await Actors.recv("add");
    console.log("CHILD GOT MSG", pat, msg);
    controller.add(msg);
  }
}

main();
