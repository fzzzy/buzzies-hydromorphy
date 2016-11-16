/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

const actions = [
  {label: "browse", icon: "👆", cursor: "pointer"},
  {label: "move", icon: "👈", cursor: "move"},
  {label: "text", icon: "🔤", cursor: "text"},
  {label: "image", icon: "🏞", cursor: "crosshair"},
  {label: "button", icon: "⏺", cursor: "crosshair"},
  {label: "field", icon: "💬", cursor: "default"},
];

let child = null;

class ImagePicker extends React.Component {
  onClick(x, e) {
    this.props.onPick(x);
    e.stopPropagation();
    e.preventDefault();
  }

  *generateImages() {
    let i = 0;
    for (let x of [
      "🏔", "⛰", "🌋", "🗻", "🏕", "🏖", "🏜", "🏝",
      "🏞", "🏟", "🏗", "🏘", "🏙", "🏭", "🏯", "🏰",
      "🗼", "🗽", "⛲", "⛺", "🌁", "🌃", "🌄", "🌅",
      "🌆", "🌇", "🌉", "🌌", "🎠", "🎡", "🎢", "🚢"]) {
      yield <button
        key={ `image:${i++}` }
        onClick={ this.onClick.bind(this, x) }
        style={{
          height: "32px",
          width: "32px",
          padding: "0px",
          fontSize: "32px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer"
        }}>
        { x }
      </button>;
    }
  }

  render() {
    return <div style={{
      display: "block",
      boxSizing: "border-box",
      height: "148px",
      width: "260px",
      border: "1px solid #ababab",
      backgroundColor: "white",
      padding: "0",
      overflow: "hidden"
    }}>
      { Array.from(this.generateImages()) }
    </div>;
  }
}

class Editing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    }
  }

  componentDidMount() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  componentDidUpdate() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  onChange(e) {
    this.setState({value: e.target.value});
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.commit(this.state.value);
    render();
  }

  render() {
    return <div style={{
      position: "relative",
      padding: "12px"
    }}>
      <form style={{
        backgroundColor: "white",
        boxSizing: "border-box",
        border: "1px solid black",
        padding: "6px"
      }} onSubmit={ this.onSubmit.bind(this) }>
        <div>
          { this.props.help }
        </div>
        <input ref={ (e) => { this.editor = e; } }
          style={{
            fontSize: "12pt",
            fontFamily: "serif",
            border: "none",
            width: "100%"
          }}
          value={ this.state.value }
          onChange={ this.onChange.bind(this) } />
      </form>
      { this.props.children }
    </div>;
  }
}

class Button extends React.Component {
  onClick(e) {
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
      "action": props.action
    };
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
    this.props.setCursor(cursor);
    this.props.setAction(action);
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
      cursor: "text",
      action: "text"
    }
  }

  setCursor(type) {
    this.setState({
      cursor: type
    });
  }

  setAction(type) {
    this.setState({
      action: type
    });
  }

  onClick(e) {
    const x = e.clientX;
    const y = e.clientY;

    this.setState({editing:
      {type: this.state.action, state: this.state.action, x: x, y: y}
    });
    render();
  }

  commit(entity) {
    if (entity) {
      this.props.child.cast("add", {
        action: this.state.action,
        x: this.state.editing.x,
        y: this.state.editing.y - 12,
        state: entity
      });
    }
    this.setState({editing: null});
  }

  pick(entity) {
    console.log("PICK", entity);
    this.props.child.cast("add", {
      action: "emoji",
      x: this.state.editing.x,
      y: this.state.editing.y - 12,
      state: entity
    });

    this.setState({editing: null});
  }

  render() {
    let editor = null;
    let editing = this.state.editing;
    if (editing) {
      if (editing.type === "text") {
        editor = <div style={{
          fontSize: "12pt",
          fontFamily: "serif",
          position: "absolute",
          left: `${ editing.x - 20 }px`,
          top: `${ editing.y - 50 }px`
        }}>
          <Editing
            help="Type text"
            commit={ this.commit.bind(this) } />
        </div>;
      } else if (editing.type === "image") {
        editor = <div>
          <div style={{
            fontSize: "16pt",
            fontFamily: "serif",
            position: "absolute",
            left: `${ editing.x - 8 }px`,
            top: `${ editing.y - 12 }px`
          }}>
            ➕
          </div>

          <Editing
            help="Enter image url"
            commit={ this.commit.bind(this) }>
            <div style={{
              padding: "6px",
              backgroundColor: "white",
              boxSizing: "border-box",
              border: "1px solid black",
              borderTop: "none"
            }}>
              Or choose image
              <ImagePicker onPick={ this.pick.bind(this) } />
            </div>
          </Editing>
        </div>;
      }
      editor = <div>
        { editor }
      </div>;
    } else {
      editor = <Toolbar
        child={ this.props.child }
        action={ this.state.action }
        setAction={ this.setAction.bind(this) }
        setCursor={ this.setCursor.bind(this) }/>;
    }

    return <div onClick={ this.onClick.bind(this) } style={{
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      overflow: "hidden",
      backgroundColor: "rgba(0, 0, 0, 0.03125)",
      cursor: this.state.cursor,
    }}>
      { editor }
    </div>;
  }
}

function render() {
  ReactDOM.render(<Editor child={ child } />, document.getElementById("root"));
}

async function main() {
  console.log("HELO client");

  child = Actors.spawn("child", {background: true});
  child.cast("hello", {message: "hello whirled", from: Actors.address()});

  render();

  let [pat, msg] = await Actors.recv("response");
  console.log("RESPONSE", pat, msg);
  msg.from.cast("responseresponse", {msg: "ha!"});
}

main();
