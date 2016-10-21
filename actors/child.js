/* globals Actors, React, ReactDOM  */


class Test extends React.Component {
  render() {
    return <h1>Child</h1>;
  }
}

async function main() {
  console.log("HELO child");

  ReactDOM.render(<Test />, document.getElementById("root"));

  const server = Actors.find("server");

  server.cast("named", {"named": "cast", from: Actors.address()});

  let [pat, msg] = await Actors.recv("test");
  console.log("GOT testMESSG", pat, msg);
  msg.from.cast("response", {msg: "it works!", from: Actors.address()});
}

main();
