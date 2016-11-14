/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

const actions = ["asdf", "qwer", "zxcv", "foo", "bar", "baz", "bamf", "quux"];
const icons = {
  asdf: "🐿",
  qwer: "🐑",
  zxcv: "☀️",
  foo: "⛈",
  bar: "💥",
  baz: "🎿",
  bamf: "🚗",
  quux: "🌅"
}


class Button extends React.Component {
  onClick() {
    this.props.onClick(this.props.action);
  }

  render() {
    const border = this.props.active ? "1px solid black" : "transparent";
    return <span style={{
      display: "inline-block",
      boxSizing: "border-box",
      width: "32px",
      height: "32px",
      fontSize: "32px",
      lineHeight: "38px",
      verticalAlign: "middle",
      textAlign: "center",
      cursor: "pointer",
      border: border
    }} onClick={ this.onClick.bind(this) }>
      { this.props.image || "🌈" }
    </span>;
  }
}

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "action": "asdf"
    }
    this.props.child.cast("clicked", {"clicked": "asdf"});
  }

  *generateButtons() {
    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      yield <Button
        onClick={ this.onClickButton.bind(this) }
        key={ `button${i}` }
        image={ icons[action] }
        action={ action }
        active={ action === this.state.action } />;
    }
  }

  onClickButton(action) {
    console.log("BUTTON", action);
    this.setState({"action": action});
    this.props.child.cast("clicked", {"clicked": action});
  }

  render() {
    return <div style={{
      position: "absolute",
      right: "0",
      top: "4px",
      width: "64px"
    }}>
      { Array.from(this.generateButtons()) }
    </div>;
  }
}

async function main() {
  console.log("HELO client");

  const child = Actors.spawn("child", {background: true});
  child.cast("test", {message: "hello whirled", from: Actors.address()});

  ReactDOM.render(<Toolbar child={ child }/>, document.getElementById("root"));

  let [pat, msg] = await Actors.recv("response");
  console.log("RESPONSE", pat, msg);
  msg.from.cast("responseresponse", {msg: "ha!"});
}

main();
