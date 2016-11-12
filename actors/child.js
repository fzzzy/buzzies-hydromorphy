/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

class HelloWorld extends React.Component {
  componentWillMount() {
    //document.body.style.backgroundColor = "#efefef";
  }

  render() {
    return <div>hello world { this.props.clicked }</div>;
  }
}

function render(clicked=0) {
  ReactDOM.render(
    <HelloWorld clicked={ clicked } />,
    document.getElementById("root"));
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
    let [pat, msg] = await Actors.recv("clicked");
    render(msg.clicked);
  }
}

main();
