/* globals Actors  */

import React from 'react';
import ReactDOM from 'react-dom';
import PouchDB from 'pouchdb-browser';

let db = new PouchDB('mydb');

async function main() {
  const el = document.createElement("h1");
  let doc = null;
  let rev;
  try {
    doc = await db.get('mydoc');
    rev = doc._rev;
  } catch (err) {
    console.error(err);
  }

  el.textContent = `Server ${ doc.title }`;
  document.body.appendChild(el);

  let [pat, msg] = await Actors.recv("named");
  if (msg && msg.from !== undefined) {
    var response = await db.put({
      _id: 'mydoc',
      _rev: rev,
      title: "Hello"
    });

    msg.from.cast("serverresponse", {msg: "response from the server", from: Actors.address()});
  }
}

main();
