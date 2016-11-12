/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: 0
    }
  }

  onClick() {
    const newclicks = this.state.clicked + 1;
    console.log("newclicks");
    this.setState({clicked: newclicks});
    this.props.child.cast("clicked", {"clicked": newclicks});
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
      cursor: "pointer"
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
    }}>
      <Button child={ this.props.child } />
      <Button child={ this.props.child } />
      <Button child={ this.props.child } />
      <Button child={ this.props.child } />
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
