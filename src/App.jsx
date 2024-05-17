import { LinkQuery, Perspective } from "@coasys/ad4m";
import Ad4mConnect from "@coasys/ad4m-connect";
import React, { useEffect, useState } from "react";
import "./App.scss";

// todo:
// + option to select perspectives, display expressions, and turn into a neighborhood
// + option to create polls with answers

// questions:
// + using full address vs. just uuid in links

// define SNDA classes for posts
// attmept complex query

function App() {
  // const { did, perspective } = await ad4m.agent.me();
  const [ad4m, setAd4m] = useState(null);
  const [localPerspectives, setLocalPerspectives] = useState([]);
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [selectedPerspective, setSelectedPerspective] = useState(null);
  // new perspective
  const [perspectiveModalOpen, setPerspectiveModalOpen] = useState(false);
  const [perspectiveName, setPerspectiveName] = useState("");
  const [perspectiveImageURL, setPerspectiveImageURL] = useState("");
  // new poll
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [pollAnswers, setPollAnswers] = useState([
    { index: 0, text: "" },
    { index: 1, text: "" },
  ]);

  const [polls, setPolls] = useState([]);

  async function getPerspectives(client) {
    client.perspective.all().then((perspectives) => {
      Promise.all(
        perspectives.map(
          (p) =>
            new Promise(async (resolve) => {
              const name = await p.get(
                new LinkQuery({ predicate: "has_name" })
              );
              const image = await p.get(
                new LinkQuery({ predicate: "has_image" })
              );
              resolve({
                perspective: p,
                name: name[0].data.target,
                image: image[0].data.target,
              });
            })
        )
      ).then((data) => {
        setLocalPerspectives(data.filter((p) => !p.perspective.neighbourhood));
        setNeighbourhoods(data.filter((p) => p.perspective.neighbourhood));
      });
    });
  }

  async function createPerspective() {
    // create perspective
    const newPerspective = await ad4m.perspective.add(
      `meta-${perspectiveName}`
    );
    // add links
    const addLinks = await ad4m.perspective.addLinks(newPerspective.uuid, [
      {
        source: newPerspective.uuid,
        predicate: "has_name",
        target: perspectiveName,
      },
      {
        source: newPerspective.uuid,
        predicate: "has_image",
        target: perspectiveImageURL,
      },
    ]);
    // update state
    Promise.all([addLinks]).then(() => {
      setPerspectiveName("");
      setPerspectiveImageURL("");
      setPerspectiveModalOpen(false);
      getPerspectives(ad4m);
    });
  }

  async function createPoll() {
    console.log("poll answers: ", pollAnswers);
    // create poll
    const pollExpression =
      await selectedPerspective.perspective.createExpression(
        { title: pollTitle, description: pollDescription },
        "literal"
      );
    // link poll to perspective
    await selectedPerspective.perspective.add({
      source: selectedPerspective.perspective.uuid,
      predicate: "has_poll",
      target: pollExpression,
    });
    // create answers
    Promise.all(
      pollAnswers.map(
        (answer) =>
          new Promise(async (resolve) => {
            const answerExpression =
              await selectedPerspective.perspective.createExpression(
                {
                  index: answer.index,
                  text: answer.text,
                },
                "literal"
              );
            // link answer to poll
            const linkAnswerToPoll = await selectedPerspective.perspective.add({
              source: pollExpression,
              predicate: "has_answer",
              target: answerExpression,
            });
            Promise.all([linkAnswerToPoll])
              .then(() => resolve())
              .catch((error) => {
                console.log("answer creation error", error);
                resolve();
              });
          })
      )
    )
      .then(() => {
        console.log("poll created");
      })
      .catch((error) => {
        console.log("poll creation error", error);
      });
  }

  async function click() {
    console.log("perspective", ad4m);
    console.log("perspectives: ", await ad4m.perspective.all());
    // const langs = await ad4m.runtime;
    // console.log("languages: ", langs);
    // console.log(await perspective.getNeighbourhoodProxy().otherAgents());

    // const myNotes = await ad4m.perspective.add("James' notes"); // d3f9b3fc-9ead-4319-91c7-d82a1d479a7e
    // console.log("myNotes: ", myNotes);

    // const expressionUrl = `literal://json:%7B%22author%22%3A%22did%3Akey%3Az6MkkH4fxefjLhRf476atrmyfdhJGtPrWBCsnGvNo9JdsVb3%22%2C%22timestamp%22%3A%222024-03-30T19%3A23%3A52.143Z%22%2C%22data%22%3A%22Hello%20World%20James%202%21%22%2C%22proof%22%3A%7B%22key%22%3A%22did%3Akey%3Az6MkkH4fxefjLhRf476atrmyfdhJGtPrWBCsnGvNo9JdsVb3%23z6MkkH4fxefjLhRf476atrmyfdhJGtPrWBCsnGvNo9JdsVb3%22%2C%22signature%22%3A%229d97afef3db607e8d2c5d7c5a2ab21dd10a99fad60b2b4bd4b99949b551dadf1e18c503cd0a837743c7c34f00ca54921c88e991d8a20abdcfcc5c959d7134b0e%22%7D%7D`;
    // const expression = await ad4m.expression.get(expressionUrl);
    // console.log("expressionUrl: ", expressionUrl);
    // console.log("expression: ", expression);

    // const myNotes = ad4m.perspective.add("My private notes");
  }

  // async function createPerspective() {
  //   console.log("perspective", ad4m);
  //   console.log("perspectives: ", await ad4m.perspective.all());
  //   // const langs = await ad4m.runtime;
  //   // console.log("languages: ", langs);
  //   // console.log(await perspective.getNeighbourhoodProxy().otherAgents());

  //   // const myNotes = await ad4m.perspective.add("James' notes"); // d3f9b3fc-9ead-4319-91c7-d82a1d479a7e
  //   // console.log("myNotes: ", myNotes);

  //   // const expressionUrl = `literal://json:%7B%22author%22%3A%22did%3Akey%3Az6MkkH4fxefjLhRf476atrmyfdhJGtPrWBCsnGvNo9JdsVb3%22%2C%22timestamp%22%3A%222024-03-30T19%3A23%3A52.143Z%22%2C%22data%22%3A%22Hello%20World%20James%202%21%22%2C%22proof%22%3A%7B%22key%22%3A%22did%3Akey%3Az6MkkH4fxefjLhRf476atrmyfdhJGtPrWBCsnGvNo9JdsVb3%23z6MkkH4fxefjLhRf476atrmyfdhJGtPrWBCsnGvNo9JdsVb3%22%2C%22signature%22%3A%229d97afef3db607e8d2c5d7c5a2ab21dd10a99fad60b2b4bd4b99949b551dadf1e18c503cd0a837743c7c34f00ca54921c88e991d8a20abdcfcc5c959d7134b0e%22%7D%7D`;
  //   // const expression = await ad4m.expression.get(expressionUrl);
  //   // console.log("expressionUrl: ", expressionUrl);
  //   // console.log("expression: ", expression);

  //   // const myNotes = ad4m.perspective.add("My private notes");
  // }

  async function createExpression() {
    const expression = await ad4m.expression.create(
      { id: 1, type: "my-post", title: "yay" },
      "literal"
    );
    console.log("expression: ", expression);
  }

  // unsure how to get them without being attached to a perspective
  async function getExpressions() {
    console.log(await ad4m.expression);
  }

  async function createPerspectiveExpression() {
    const perspective = await ad4m.perspective.byUUID(
      "d3f9b3fc-9ead-4319-91c7-d82a1d479a7e"
    );
    const post = await perspective.createExpression(
      { id: 1, type: "post", title: "New post!" },
      "literal"
    );
    console.log("post: ", post);
    const { did } = await ad4m.agent.me();
    const newLink = {
      source: did,
      predicate: "sioc://has_post",
      target: post,
    };
    console.log("newLink: ", newLink);
    const link = await perspective.add(newLink);
    console.log("link: ", link);
  }

  async function getPolls() {
    // const perspective = await ad4m.perspective.byUUID(
    //   "d3f9b3fc-9ead-4319-91c7-d82a1d479a7e"
    // );
    console.log(selectedPerspective);
    // get post links
    const pollLinks = await selectedPerspective.perspective.get(
      new LinkQuery({ predicate: "has_poll" })
    );
    // get polls from links
    const polls = await Promise.all(
      pollLinks.map(
        (pollLink) =>
          new Promise(async (resolve) => {
            const poll = await ad4m.expression.get(pollLink.data.target);
            resolve({
              literal: pollLink.data.target,
              data: poll.data ? JSON.parse(poll.data) : {},
            });
          })
      )
    );

    console.log("pollLinks: ", pollLinks);
    console.log("polls: ", polls);
    // get answers
    const pollsWithAnswers = await Promise.all(
      polls.map(
        (poll) =>
          new Promise(async (resolve) => {
            // get answer links
            const answerLinks = await selectedPerspective.perspective.get(
              new LinkQuery({ source: poll.literal, predicate: "has_answer" })
            );
            const answers = await Promise.all(
              answerLinks.map((link) => ad4m.expression.get(link.data.target))
            );
            resolve({
              poll,
              answers: answers.map((a) => (a.data ? JSON.parse(a.data) : {})),
            });
          })
      )
    );
    console.log("pollsWithAnswers: ", pollsWithAnswers);
    setPolls(pollsWithAnswers);
    // setPolls(polls.map((p) => (p.data.data ? JSON.parse(p.data.data) : {})));
    // console.log("polls: ", polls);
  }

  async function createNeighborhood() {
    const linkLangs = await ad4m.runtime.knownLinkLanguageTemplates();
    // const langExpression = await ad4m.expression.getMany(
    //   linkLangs.map((l) => `lang://${l}`)
    // );
    // console.log(
    //   "langExpression: ",
    //   langExpression.map((l) => JSON.parse(l.data))
    // );

    // create cloned language
    const uniqueLinkLanguage = await ad4m.languages.applyTemplateAndPublish(
      linkLangs[0],
      JSON.stringify({
        uuid: "84a029-77584c-1c10fb",
        name: "Perspective Diff Sync clone",
      })
    );

    const meta = new Perspective();

    const neighbourhoodUrl = await ad4m.neighbourhood.publishFromPerspective(
      "d3f9b3fc-9ead-4319-91c7-d82a1d479a7e", // perspective uuid
      uniqueLinkLanguage.address, // link language address
      meta
    );

    console.log("neighbourhoodUrl: ", neighbourhoodUrl);

    // neighbourhood://QmzSYwdbQqVtBW5XjikZVSEzcs5pzhzXgcEyo3o5nvCMzQD7AyH
  }

  async function getNeighbourhoodData() {}

  function initializeAd4m() {
    const ui = Ad4mConnect({
      appName: "My First ADAM App",
      appDesc: "This is my first app here.",
      appDomain: "ad4m.dev",
      appIconPath: "https://i.ibb.co/GnqjPJP/icon.png",
      capabilities: [{ with: { domain: "*", pointers: ["*"] }, can: ["*"] }],
      hosting: true,
    });
    ui.connect().then((client) => {
      setAd4m(client);
      getPerspectives(client);
      console.log("client", client);
    });
  }

  function fetchNooNaoData() {
    fetch(
      "https://noo.network/api/murmur/network/5ad4c227-d78b-4e62-a192-bb4506f40213"
    )
      .then((resp) => resp.json())
      .then((data) => console.log("mur data: ", data));
  }

  useEffect(() => initializeAd4m(), []);

  // get expressions when selected perspective changes
  useEffect(() => {
    console.log(selectedPerspective);
    if (selectedPerspective) getPolls();
  }, [selectedPerspective]);

  return (
    <div className="wrapper">
      <h1>Ad4m app</h1>

      <button
        className="button"
        onClick={() => setPerspectiveModalOpen(!perspectiveModalOpen)}
      >
        New Perspective
      </button>

      {perspectiveModalOpen && (
        <div className="column centerX border" style={{ padding: 10 }}>
          <div className="row centerY" style={{ marginBottom: 10 }}>
            <p style={{ marginRight: 10 }}>Name:</p>
            <input
              className="input"
              value={perspectiveName}
              onChange={(e) => setPerspectiveName(e.target.value)}
            />
          </div>
          <div className="row centerY" style={{ marginBottom: 10 }}>
            <p style={{ marginRight: 10 }}>Image URL:</p>
            <input
              className="input"
              value={perspectiveImageURL}
              onChange={(e) => setPerspectiveImageURL(e.target.value)}
            />
          </div>
          <button className="button" onClick={createPerspective}>
            Create Perspective
          </button>
        </div>
      )}

      <h2>Local Perspectives</h2>
      <div>
        {localPerspectives.map((p) => (
          <button
            key={p.perspective.uuid}
            className={`perspective-icon ${
              selectedPerspective &&
              p.perspective.uuid === selectedPerspective.perspective.uuid &&
              "selected"
            }`}
            onClick={() => setSelectedPerspective(p)}
          >
            <img src={p.image} alt="" />
            <p>{p.name}</p>
          </button>
        ))}
      </div>

      {/* <h2>Neighbourhoods</h2>
      <div>
        {neighbourhoods.map((n) => (
          <button onClick={() => setSelectedPerspective(n)}>{n.name}</button>
        ))}
      </div> */}

      {selectedPerspective && (
        <div
          className="border column centerX"
          style={{ width: "calc(100% - 60px)" }}
        >
          <div className="row centerY" style={{ marginBottom: 10 }}>
            <img
              src={selectedPerspective.image}
              alt=""
              className="image-small"
            />
            <h2>{selectedPerspective.name}</h2>
          </div>

          <button
            className="button"
            onClick={() => setPollModalOpen(!pollModalOpen)}
          >
            New Poll
          </button>

          {pollModalOpen && (
            <div className="column centerX border" style={{ padding: 10 }}>
              <div className="row centerY" style={{ marginBottom: 10 }}>
                <p style={{ marginRight: 10 }}>Title:</p>
                <input
                  className="input"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                />
              </div>
              <div className="row centerY" style={{ marginBottom: 10 }}>
                <p style={{ marginRight: 10 }}>Description:</p>
                <input
                  className="input"
                  value={pollDescription}
                  onChange={(e) => setPollDescription(e.target.value)}
                />
              </div>
              <div>
                <p style={{ marginBottom: 10 }}>Answers:</p>
                {pollAnswers.map((answer, index) => (
                  <div className="row centerY" style={{ marginBottom: 10 }}>
                    <p style={{ marginRight: 10 }}>{index + 1}</p>
                    <input
                      className="input"
                      value={answer.text}
                      onChange={(e) => {
                        const newAnswers = [...pollAnswers];
                        newAnswers[index] = { index, text: e.target.value };
                        setPollAnswers(newAnswers);
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                className="button"
                style={{ marginBottom: 10 }}
                onClick={() =>
                  setPollAnswers([
                    ...pollAnswers,
                    { index: pollAnswers.length, text: "" },
                  ])
                }
              >
                Add answer
              </button>
              <button className="button" onClick={createPoll}>
                Create Poll
              </button>
            </div>
          )}

          <div>
            {polls.map((p) => (
              <div className="post">
                {/* <p>ID: {p.uuid}</p> */}
                <p>Title: {p.poll.data.title}</p>
                <p>Description: {p.poll.data.description}</p>
                <div className="column">
                  {p.answers.map((answer) => (
                    <div className="row centerY">
                      <p style={{ marginRight: 10 }}>{answer.index + 1}</p>
                      <p>{answer.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
