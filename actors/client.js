/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

const actions = [
  {label: "text", icon: "🐿", cursor: "text"},
  {label: "picture", icon: "🐑", cursor: "crosshair"},
  {label: "field", icon: "⛈", cursor: "text"},
  {label: "button", icon: "☀️", cursor: "crosshair"},
  {label: "bar", icon: "💥", cursor: "default"},
  {label: "baz", icon: "🎿", cursor: "default"},
  {label: "bamf", icon: "🚗", cursor: "default"},
  {label: "quux", icon: "🌅", cursor: "default"}
];

class Button extends React.Component {
  onClick(e) {
    console.log("BUTTON ONCLICK");
    e.stopPropagation();
    this.props.onClick(this.props.action.label, this.props.action.cursor);
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
      { this.props.action.icon || "🌈" }
    </span>;
  }
}

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "action": "text"
    }
    this.props.child.cast("action", {"action": "text"});
  }

  *generateButtons() {
    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      yield <Button
        onClick={ this.onClickButton.bind(this) }
        key={ `button${i}` }
        action={ action }
        active={ action.label === this.state.action } />;
    }
  }

  onClickButton(action, cursor) {
    console.log("BUTTON", action);
    this.setState({"action": action});
    this.props.child.cast("action", {"action": action});
    this.props.setCursor(cursor);
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

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursor: "text"
    }
  }

  setCursor(type) {
    this.setState({
      cursor: type
    });
  }

  onClick(e) {
    console.log("EDITOR ONCLICK");
    this.props.child.cast("add", {x: e.clientX, y: e.clientY});
    console.log("ONCLICK", e.clientX, e.clientY);
  }

  render() {
    return <div onClick={ this.onClick.bind(this) } style={{
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.03125)",
      cursor: this.state.cursor,
    }}>
      <Toolbar child={ this.props.child } setCursor={ this.setCursor.bind(this) }/>
    </div>;
  }
}

async function main() {
  console.log("HELO client");

  const child = Actors.spawn("child", {background: true});
  child.cast("test", {message: "hello whirled", from: Actors.address()});

  ReactDOM.render(<Editor child={ child } />, document.getElementById("root"));

  let [pat, msg] = await Actors.recv("response");
  console.log("RESPONSE", pat, msg);
  msg.from.cast("responseresponse", {msg: "ha!"});
}

main();
