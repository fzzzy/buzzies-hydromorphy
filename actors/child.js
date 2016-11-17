/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

let controller = null;
let state = null;
let moving = null;
//let entities = [{action: "button", x: 233, y: 132, state: "button"}];
let entities = [];

function render() {
  ReactDOM.render(
    <HelloWorld entities={ entities } />,
    document.getElementById("root"));
}

function makeEvent(name, x, y) {
  return new MouseEvent(name, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    screenX: x + window.screenX,
    screenY: y + window.screenY
  });
}

class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    }
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  render() {
    return <input
      ref={ (e) => { this.input = e; } }
      name={ this.props.name }
      value={ this.state.value }
      onChange={ (e) => { this.setState({value: e.target.value}) } }
      onClick={ (e) => { e.target.focus() }}></input>
  }
}

class Entity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevX: 0,
      prevY: 0
    };
  }

  onMouseDown(e) {
    if (state === "move") {
      let {top, left, height, width} = this.node.getBoundingClientRect();
      if (this.props.entity.action === "emoji") {
        height -= 28;
      }
      controller.selected({top, left, height, width});
      moving = this.props.entity;
      this.setState({prevX: e.clientX, prevY: e.clientY});
      e.preventDefault();
      e.stopPropagation();
    }
  }

  onMouseMove(e) {
    if (state === "move" && moving === this.props.entity) {
      e.preventDefault();
      e.stopPropagation();
      let deltaX = this.state.prevX - e.clientX;
      let deltaY = this.state.prevY - e.clientY;
      moving.x -= deltaX;
      moving.y -= deltaY;
      this.setState({prevX: e.clientX, prevY: e.clientY});
      let {top, left, height, width} = this.node.getBoundingClientRect();
      if (this.props.entity.action === "emoji") {
        height -= 28;
      }
      window.requestAnimationFrame(
        () => controller.selected({top, left, height, width}));
    }
  }

  onMouseUp(e) {
    if (state === "move") {
      //controller.deselected();
      e.preventDefault();
      e.stopPropagation();
      moving = null;
      this.setState({prevX: 0, prevY: 0});
    }
  }

  onClick(e) {
    if (state === "move") {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  render() {
    return <div
      ref={ (e) => this.node = e }
      onMouseDown={ this.onMouseDown.bind(this) }
      onMouseMove={ this.onMouseMove.bind(this) }
      onMouseUp={ this.onMouseUp.bind(this) }
      onClick={ this.onClick.bind(this) }
    >
      { this.props.children }
    </div>;
  }
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
          fontSize: "128px",
          lineHeight: "156px",
        }}>
          { ent.state }
        </span>;
      } else if (ent.action === "button") {
        val = <button onMouseDown={ (e) => {
          e.target.focus();
        }}
        onMouseUp={ (e) => {
          e.target.blur();
        }}>
          { ent.state }
        </button>;
      } else if (ent.action === "field") {
        val = <Field name={ ent.state } value="" />;
      } else {
        val = ent.action;
      }
      yield <div style={{
        position: "absolute",
        top: `${ ent.y }px`,
        left: `${ ent.x }px`,
      }} key={ i++ }>
        <Entity entity={ ent }>
          { val }
        </Entity>
      </div>;
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

  action({action, type, x, y}) {
    if (action === "browse") {
      state = "browse";
      //console.log("BROWSE", x, y);
      let e = makeEvent(type, x, y);
      document.elementFromPoint(x, y).dispatchEvent(e);
    } else if (action === "move") {
      state = "move";
      let e = makeEvent(type, x, y);
      document.elementFromPoint(x, y).dispatchEvent(e);
    }
//    console.log("ACTION", action, x, y)
    render();
  }

  add(obj) {
    entities.push(obj);
    this.deselected();
    render();
  }

  selected({top, left, height, width}) {
    this.parent.cast("selected", {top, left, height, width});
  }

  deselected() {
    this.parent.cast("deselected");
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
