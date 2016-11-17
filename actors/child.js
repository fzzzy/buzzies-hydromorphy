/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

let controller = null;
let entities = [{action: "button", x: 233, y: 132, state: "button"}];

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
      } else if (ent.action === "button") {
        val = <button onMouseDown={ (e) => {
          console.log("el buttono md");
        }}
        onMouseUp={ (e) => {
          console.log("el buttono mu");
        }}
        onClick={ (e) => {
          console.log("clicked el buttono", ent.state, e.clientX, e.clientY);
        }}>{ ent.state }</button>;
      } else if (ent.action === "field") {
        val = <input value={ ent.state }></input>;
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

  action({action, x, y}) {
    if (action === "browse") {
      console.log("BROWSE", x, y);
      //document.elementFromPoint(x, y).click()
    } else if (action === "mousedown") {
      let e = new MouseEvent("mousedown", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      document.elementFromPoint(x, y).dispatchEvent(e);
    } else if (action === "mouseup") {
      let e = new MouseEvent("mouseup", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      });
      document.elementFromPoint(x, y).dispatchEvent(e);
    }
//    console.log("ACTION", action, x, y)
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
    let [pat, msg] = await Actors.recv(["add", "action"]);
    if (pat === "add") {
      controller.add(msg);
    } else if (pat === "action") {
      controller.action(msg);
    }
  }
}

main();
