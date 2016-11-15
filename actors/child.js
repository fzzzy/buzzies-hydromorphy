/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

let state = null;
let editing = null;
let entities = [];

function render(clicked=null) {
  if (clicked !== null) {
    state = clicked;
  }
  ReactDOM.render(
    <HelloWorld clicked={ state } entities={ entities } />,
    document.getElementById("root"));
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    }
  }

  componentDidMount() {
    if (editing !== null && this.editor) {
      this.editor.focus();
    }
  }

  onChange(e) {
    editing.state = e.target.value;
    this.setState({value: e.target.value});
  }

  onSubmit(e) {
    e.preventDefault();
    editing = null;
    render();
  }

  render() {
    return <form onSubmit={ this.onSubmit.bind(this) }>
      <div style={{
        position: "relative",
        top: "-20px",
        left: "0"
      }}>
        { this.props.help }
      </div>
      <input ref={ (e) => { this.editor = e; } }
        style={{
          position: "relative",
          top: "-20px",
          fontSize: "12pt",
          fontFamily: "serif",
          border: "none"
        }}
        value={ this.state.value }
        onChange={ this.onChange.bind(this) } />
    </form>;
  }
}

class HelloWorld extends React.Component {
  componentWillMount() {
    //document.body.style.backgroundColor = "#efefef";
  }

  *generateEntities() {
    let i = 0;
    for (var ent of this.props.entities) {
      let content = ent.state;
      if (ent === editing) {
        if (ent.type === "text") {
          content = <Editor help="Type text" />;
        } else if (ent.type === "picture") {
          content = <Editor help="Enter image url" />;
        }
      } else {
        if (ent.type === "picture") {
          content = <img src={ content } />;
        }
      }
      yield <div key={ i++ } style={{
        fontSize: "12pt",
        fontFamily: "serif",
        position: "absolute",
        left: `${ent.x}px`,
        top: `${ent.y}px`
      }}>
        { content }
      </div>
    }
  }

  render() {
    return <div>
      { this.props.clicked }
      { Array.from(this.generateEntities() )}
    </div>;
  }
}

class Controller {
  action({action}) {
    render(action);
  }

  add({x, y}) {
    const obj = {type: state, state: state, x: x, y: y - 12};
    if (state === "text" || state === "picture") {
      obj.state = "";
      editing = obj;
    }
    entities.push(obj);
    render();
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

  const c = new Controller();

  while (true) {
    let [pat, msg] = await Actors.recv(
      ["action", "add"]
    );
    console.log("CHILD GOT MSG", pat, msg);
    if (pat === "action") {
      c.action(msg);
    } else if (pat === "add") {
      c.add(msg);
    }
  }
}

main();
