/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

let state = null;
let entities = [];

function render(clicked=null) {
  if (clicked !== null) {
    state = clicked;
  }
  ReactDOM.render(
    <HelloWorld clicked={ state } entities={ entities } />,
    document.getElementById("root"));
}

class HelloWorld extends React.Component {
  componentWillMount() {
    //document.body.style.backgroundColor = "#efefef";
  }

  *generateEntities() {
    let i = 0;
    for (var ent of this.props.entities) {
      yield <div key={ i++ } style={{
        position: "absolute",
        left: `${ent.x}px`,
        top: `${ent.y}px`
      }}>
{ ent.state }
      </div>
    }
  }

  render() {
    return <div>
      hello world { this.props.clicked }
      { Array.from(this.generateEntities() )}
    </div>;
  }
}

async function main() {
  console.log("HELO child");

  render();

  const server = Actors.find("server");

  server.cast("named", {"named": "cast", from: Actors.address()});

  let [pat, msg] = await Actors.recv("test");
  console.log("GOT testMESSG", pat, msg);
  msg.from.cast("response", {msg: "it works!", from: Actors.address()});

  while (true) {
    let [pat, msg] = await Actors.recv(["action", "add"]);
    console.log("CHILD GOT MSG", pat, msg);
    if (pat === "action") {
      render(msg.action);
    } else if (pat === "add") {
      entities.push({state: state, x: msg.x, y: msg.y});
      render();
    }
  }
}

main();
