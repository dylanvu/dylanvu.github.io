"use client";

import React from "react";
import { useState, useEffect } from "react";
import Axios from "axios";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import "@/styles/contribution.css";
import Paragraph from "./content-block/Paragraph";
import ContentBlockTitle from "./content-block/ContentBlockTitle";
import ContactButton from "./contact/ContactButton";

const Contributions = () => {
  const [contribution, setContrib] = useState("");
  const [repoLink, setRepolink] = useState("");
  const [allRepos, setAllrepos] = useState([{ name: "", url: "" }]);
  const [backupRepo, setbackupRepo] = useState("");
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const username = "dylanvu";

  useEffect(() => {
    // TODO: Get description of the featured GitHub Repo
    // https://docs.github.com/en/rest/reference/activity#list-public-events-for-a-user
    // Use Github API to get most recent push
    // Safari was broken so try this: https://stackoverflow.com/questions/47877808/axios-get-not-working-in-safari-browser
    const githubAPI = `https://api.github.com/users/${username}/events/public?nocache=${new Date().getTime()}`;
    Axios.get(githubAPI, {
      params: { per_page: 100 },
    })
      .then((res) => {
        // console.log(res.data);
        let allPush = [];
        let first = true;

        // Iterate through all events and get only push events to display
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].type === "PushEvent") {
            let name = res.data[i].repo.name.split("/").at(-1);
            // Change the name to this website if the last thing I worked on was my portfolio
            if (
              name === `${username}.github.io` ||
              name === "vu-dylan.github.io"
            ) {
              name = "this website";
            } else {
              const nameArr = name.split("-");
              name = "";
              nameArr.forEach((namePart: string) => {
                if (i) {
                  name = namePart;
                } else {
                  name = name + " " + namePart;
                }
              });
            }
            if (first) {
              first = false;
              // console.log(name)
              setContrib(name);
              setRepolink("https://github.com/" + res.data[i].repo.name);
            }
            allPush.push({
              name: name,
              url: "https://github.com/" + res.data[i].repo.name,
            });
          }
        }
        // If there is literally no push events, just show the last thing I did.
        if (first) {
          setContrib(res.data[0].repo.name.split("/").at(-1));
          setRepolink("https://github.com/" + res.data[0].repo.name);
        }
        // Remove duplicates
        // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
        allPush = [
          ...new Map(allPush.map((v) => [JSON.stringify(v), v])).values(),
        ];
        // Remove first element, which is the most recent thing
        allPush.shift();
        setDone(true);
        // check if repos were actually gotten
        if (allPush.length) {
          setAllrepos(allPush);
        } else {
          // just push something random to display null
          allPush = [{ name: "", url: "" }];
        }
      })
      .catch((e) => {
        console.error(e);
        setDone(true);
      });
  }, []);

  useEffect(() => {
    if (done && allRepos.length > 0) {
      setTimeout(() => {
        Type(allRepos[index].name);
      }, 2000);
    }
  }, [allRepos]);

  function Type(text: string) {
    let currText = text[0];
    let i = 0;
    // Animate "typing"
    setTimeout(() => {
      const textHandle = setInterval(() => {
        setbackupRepo(currText);
        i++;
        currText = currText + text[i];
        if (i >= text.length) {
          setTimeout(() => {
            // Getting some weird stuff with accessing states inside this function, so just set it again and delete it
            DeleteText(text);
          }, 3000);
          clearInterval(textHandle);
        }
      }, 60);
    }, 600);
  }

  function DeleteText(text: string) {
    let i = text.length;
    // Animate "deletion"
    setTimeout(() => {
      const textHandle = setInterval(() => {
        setbackupRepo(text.slice(0, i));
        i--;
        if (i < 0) {
          clearInterval(textHandle);
          // Now we cycle to the next repo
          if (index + 1 >= allRepos.length) {
            setIndex(0);
          } else {
            setIndex(index + 1);
          }
        }
      }, 60);
    }, 600);
  }

  useEffect(() => {
    if (done) {
      Type(allRepos[index].name);
    }
  }, [index]);

  const currentPursuits = [
    "Software Dev Engineer I at Amazon Health (One Medical)",
    "Mentoring hackathons",
  ];

  return (
    <>
      <ContentBlockTitle title={"What I'm Up To"} />
      <div className="contribution">
        {currentPursuits.map((pursuit, index) => (
          <Paragraph text={"* " + pursuit} key={"pursuit" + index} />
        ))}
      </div>
      {/* GitHub/Most Recent Project */}
      {done ? (
        <div className="contribution">
          {contribution === "" ? (
            <div>
              Thanks for stopping by! Come learn more about me and my projects!
            </div>
          ) : (
            <div>
              The last thing I&apos;ve worked on was{" "}
              <span>
                <a
                  href={repoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="repo-link"
                >
                  {contribution}
                </a>
              </span>
              ! Check it out!
            </div>
          )}
          {allRepos[0].name === "" ||
          allRepos[0].url === "" ||
          contribution === "" ? null : (
            <div>
              <div>
                Think that&apos;s pretty cool? Or maybe it wasn&apos;t your cup
                of tea?
              </div>
              <div>
                What about{" "}
                <span>
                  <a
                    href={allRepos[index].url}
                    target="_blank"
                    rel="noreferrer"
                    className="repo-link"
                  >
                    {backupRepo}
                  </a>
                </span>
                ?
              </div>
              <div>Maybe you&apos;ll find something even better here?</div>
              <ContactButton
                title="View GitHub"
                link={`https://github.com/${username}`}
                icon={faGithub}
                id="github"
              />
              {/* <div>
                                <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
                                    <FontAwesomeIcon
                                        icon={faGithub}
                                        id="github"
                                        className="githubIcon"
                                    />
                                </a>
                            </div> */}
            </div>
          )}
        </div>
      ) : (
        // loading circle
        <div className="lds-ripple">
          <div></div>
          <div></div>
        </div>
      )}
      {/* About Me/Current Pursuits */}
    </>
  );
};

export default Contributions;
