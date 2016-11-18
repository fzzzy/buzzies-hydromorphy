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
let offsetX = 0;
let offsetY = 0;
let selection = null;
let ants = 0;

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
        <div style={{
          marginBottom: "12px"
        }}>
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

class SimpleEditor extends React.Component {
  render() {
    return <div style={{
      fontSize: "12pt",
      fontFamily: "serif",
      position: "absolute",
      left: `${ this.props.editing.x - 20 }px`,
      top: `${ this.props.editing.y - 62 }px`
    }}>
      <Editing help={ this.props.help } commit={ this.props.commit } />
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
      width: "36px",
      height: "36px",
      fontSize: "32px",
      lineHeight: "40px",
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
      action: props.action,
      animating: false,
      originX: 0,
      originY: 0,
      offsetX: offsetX,
      offsetY: offsetY
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
    //console.log("BUTTON", action);
    selection = null;
    this.setState({"action": action});
    this.props.setCursor(cursor);
    this.props.setAction(action);
  }

  onMouseDownTitleBar(e) {
    this.setState({animating: true, originX: e.clientX - this.state.offsetX, originY: e.clientY - this.state.offsetY});
    e.preventDefault();
    e.stopPropagation();
  }

  onMouseMoveTitleBar(e) {
    if (this.state.animating) {
      this.setState({offsetX: e.clientX - this.state.originX, offsetY: e.clientY - this.state.originY});
      e.preventDefault();
      e.stopPropagation();
    }
  }

  onMouseUpTitleBar(e) {
    this.setState({animating: false});
    offsetX = this.state.offsetX;
    offsetY = this.state.offsetY;
    e.preventDefault();
    e.stopPropagation();
  }

  onClickTitleBar(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    return <div style={{
      position: "absolute",
      right: `${ - this.state.offsetX }px`,
      top: `${ this.state.offsetY }px`,
      width: "74px",
      boxSizing: "border-box",
      border: "1px solid #ababab",
      backgroundColor: "#efefef"
    }}>
      <div onMouseDown={ this.onMouseDownTitleBar.bind(this) }
        onMouseMove={ this.onMouseMoveTitleBar.bind(this) }
        onMouseUp={ this.onMouseUpTitleBar.bind(this) }
        onClick={ this.onClickTitleBar.bind(this) }
        style={{
          boxSizing: "border-box",
          borderBottom: "1px solid #ababab",
          backgroundColor: "#cdcdcd",
          height: "32px",
          width: "100%",
          cursor: "move"
        }}>

      </div>
      { Array.from(this.generateButtons()) }
    </div>;
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cursor: "pointer",
      action: "browse",
      mousedown: false
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

    if (this.state.action === "text" || this.state.action === "image" ||
      this.state.action === "button" || this.state.action === "field") {
      this.setState({editing:
        {type: this.state.action, state: this.state.action, x: x, y: y}
      });
      render();
    } else {
      this.props.child.cast("action", {action: this.state.action, type: "click", x, y});
    }
  }

  onMouseDown(e) {
    if (this.state.action === "browse" || this.state.action === "move") {
      this.setState({mousedown: true});
      this.props.child.cast("action", {action: this.state.action, type: "mousedown", x: e.clientX, y: e.clientY});
    }
  }

  onMouseMove(e) {
    if (this.state.mousedown) {
      this.props.child.cast("action", {action: this.state.action, type: "mousemove", x: e.clientX, y: e.clientY});
    }
  }

  onMouseUp(e) {
    if (this.state.mousedown) {
      this.setState({mousedown: false});
      this.props.child.cast("action", {action: this.state.action, type: "mouseup", x: e.clientX, y: e.clientY});
    }
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
    let showSelection = null;
    if (selection) {
      showSelection = <Selection
        top={ selection.top } left={ selection.left }
        height={ selection.height } width={ selection.width } />
    }

    let editor = null;
    let editing = this.state.editing;
    if (editing) {
      if (editing.type === "text") {
        editor = <SimpleEditor
          editing={ editing }
          help="Type text"
          commit={ this.commit.bind(this) } />;
      } else if (editing.type === "button") {
        editor = <SimpleEditor
          editing={ editing }
          help="Enter button label"
          commit={ this.commit.bind(this) } />;
      } else if (editing.type === "field") {
        editor = <SimpleEditor
          editing={ editing }
          help="Enter field name"
          commit={ this.commit.bind(this) } />;
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

    return <div
      onMouseDown={ this.onMouseDown.bind(this) }
      onMouseMove={ this.onMouseMove.bind(this) }
      onMouseUp={ this.onMouseUp.bind(this) }
      onClick={ this.onClick.bind(this) }
      style={{
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
      { showSelection }
    </div>;
  }
}

class Selection extends React.Component {
  render() {
    return <div style={{
      borderImage: "url('selection.gif') 1 1 1 1 repeat repeat",
      borderStyle: "dashed",
      borderWidth: "1px",
      pointerEvents: "none",
      position: "absolute",
      top: `${ this.props.top }px`,
      left: `${ this.props.left }px`,
      width: `${ this.props.width }px`,
      height: `${ this.props.height }px`,
    }}></div>;
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

  while (true) {
    let [pat, msg] = await Actors.recv(["selected", "deselected"]);
    if (pat === "selected") {
      selection = msg;
      render();
    } else if (pat === "deselected") {
      selection = null;
      render();
    }
  }
}

main();
