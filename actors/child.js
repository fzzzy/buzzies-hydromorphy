/* globals Actors, React, ReactDOM  */

class HelloWorld extends React.Component {
  componentWillMount() {
    //document.body.style.backgroundColor = "#efefef";
  }

  render() {
    return <div>hello world</div>;
  }
}

async function main() {
  console.log("HELO child");

  ReactDOM.render(<HelloWorld />, document.getElementById("root"));

  const server = Actors.find("server");

  server.cast("named", {"named": "cast", from: Actors.address()});

  let [pat, msg] = await Actors.recv("test");
  console.log("GOT testMESSG", pat, msg);
  msg.from.cast("response", {msg: "it works!", from: Actors.address()});
}

main();
