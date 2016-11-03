/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  onClick() {
    console.log("clicked");
  }

  render() {
    return <span style={{
      display: "inline-block",
      width: "32px",
      height: "32px",
      fontSize: "32px",
      lineHeight: "32px",
      verticalAlign: "middle",
      textAlign: "center",
    }} onClick={ this.onClick.bind(this) }>{ this.props.image || "🌈" }</span>;
  }
}

class Toolbar extends React.Component {
  render() {
    return <div style={{
      position: "absolute",
      right: "0",
      top: "4px",
      width: "64px"
    }}><Button /><Button /><Button /><Button /></div>;
  }
}

async function main() {
  console.log("HELO client");

  ReactDOM.render(<Toolbar />, document.getElementById("root"));

  const child = Actors.spawn("child");
  child.cast("test", {message: "hello whirled", from: Actors.address()});

  let [pat, msg] = await Actors.recv("response");
  console.log("RESPONSE", pat, msg);
  msg.from.cast("responseresponse", {msg: "ha!"});
}

main();
