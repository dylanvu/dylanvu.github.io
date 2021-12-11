import {React, useState, useEffect} from 'react';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

const Contributions = () => {

    const [contribution, setContrib] = useState("");
    const [repoLink, setRepolink] = useState("");
    const [allRepos, setAllrepos] = useState([{name: "", url: ""}]);
    const [backupRepo, setbackupRepo] = useState("");
    const [index, setIndex] = useState(0);
    const [done, setDone] = useState(false);
    useEffect(() => {
        // TODO: Get description of the featured GitHub Repo
        // https://docs.github.com/en/rest/reference/activity#list-public-events-for-a-user
        // Use Github API to get most recent push
        Axios.get("https://api.github.com/users/vu-dylan/events/public", {
            params: {per_page: 70}
        }).then((res) => {
            // console.log(res.data);
            let allPush = [];
            let first = true;

            // Iterate through all events and get only push events to display
            for (let i = 0; i < res.data.length; i++) {
                if (res.data[i].type === 'PushEvent') {
                    let name = res.data[i].repo.name.split('/').at(-1);
                    // Change the name to this website if the last thing I worked on was my portfolio
                    if (name === "vu-dylan.github.io") {
                        name = "this website";
                    }
                    if (first) {
                        first = false;
                        // console.log(name)
                        setContrib(name);
                        setRepolink("https://github.com/" + res.data[i].repo.name);
                    }
                    allPush.push({name: name, url: "https://github.com/" + res.data[i].repo.name})
                } else {
                    console.log(res.data[i])
                }
            }
            // If there is literally no push events, just show the last thing I did.
            if (first) {
                setContrib(res.data[0].repo.name.split('/').at(-1));
                setRepolink("https://github.com/" + res.data[0].repo.name);
            }
            // Remove duplicates
            // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
            allPush = [...new Map(allPush.map(v => [JSON.stringify(v), v])).values()]
            // Remove first element, which is the most recent thing
            allPush.shift();
            setDone(true);
            setAllrepos(allPush);
        });
    }, []);

    useEffect(() => {
        if (done && allRepos.length > 0) {
            setTimeout(() => {
                Type(allRepos[index].name);
            }, 2000);
            
        }
    }, [allRepos]);

    function Type(text) {
		let currText = text[0];
		let i = 0;
		// Animate "typing"
		setTimeout(() => {
			let textHandle = setInterval(() => {
				setbackupRepo(currText);
				i++;
				currText = currText + text[i];
				if (i >= text.length) {
                    setTimeout(() => {
                        // Getting some weird stuff with accessing states inside this function, so just set it again and delete it
                        DeleteText(text);
                    }, 3000)
					clearInterval(textHandle);
				}
			}, 60);
		}, 600);
    }

    function DeleteText(text) {
        let i = text.length;
        // Animate "deletion"
        setTimeout(() => {
			let textHandle = setInterval(() => {
				setbackupRepo(text.slice(0,i));
				i--;
				if (i < 0) {
					clearInterval(textHandle);
                    // Now we cycle to the next repo
                    if (index + 1 >= allRepos.length) {
                        setIndex(0)
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

    return (
        <div className="contribution">
            <div>
                The last thing I've worked on was <span><a href={repoLink} target="_blank" rel="noreferrer">{contribution}</a></span>! Check it out!
            </div>
            {allRepos.length > 0 ? <div>
                <div>
                    Think that's pretty cool? Or maybe it wasn't your cup of tea?
                </div>
                <div>
                    What about <span><a href={allRepos[index].url} target="_blank" rel="noreferrer">{backupRepo}</a></span>?
                </div>
            </div> : null}
            <div>
                Maybe you'll find something here?
            </div>
            <div>
                <a href="https://github.com/vu-dylan" target="_blank" rel="noreferrer" style={{ color: "#f2f2f2" }}>
                    <FontAwesomeIcon
                        icon={faGithub}
                        id="github"
                        style={{color: "#36393f", fontSize: "6rem"}}
                    />
                </a>
            </div>
        </div>
    )
}

export default Contributions