import React, { useCallback, useEffect, useState } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { getMicrophonePresences } from "../../utils/microphone-presence";
import { ChatSidebarContainer } from "./ChatSidebarContainer";
var selectedd = "everyone";
var selectedId = "";
function userFromPresence(sessionId, presence, micPresences, mySessionId) {
  const meta = presence.metas[presence.metas.length - 1];
  const micPresence = micPresences.get(sessionId);
  return { id: sessionId, isMe: mySessionId === sessionId, micPresence, ...meta };
}
function usePeopleList(presences, mySessionId, micUpdateFrequency = 500) {
  let [people, setPeople] = useState([]);

  useEffect(() => {
    let timeout;

    function updateMicrophoneState() {
      const micPresences = getMicrophonePresences();

      setPeople(
        Object.entries(presences).map(([id, presence]) => {
          return userFromPresence(id, presence, micPresences, mySessionId);
        })
      );

      timeout = setTimeout(updateMicrophoneState, micUpdateFrequency);
    }

    updateMicrophoneState();

    return () => {
      clearTimeout(timeout);
    };
  }, [presences, micUpdateFrequency, setPeople, mySessionId]);

  //aptero state cleanup
  people = people.filter(value => {
    return presences[value.id];
  });
  return people;
}
export function DropDownChatList({ presences, selected, setSelected }) {
  //const x= new UIRoot();
  //console.log(option)
  const [isActive, setIsActive] = useState(false);
  const options = ["React", "Vue", "Angular"];
  const micUpdateFrequency = 500;
  const people = usePeopleList(presences, NAF.clientId, micUpdateFrequency);
  const every_one = "everyone";
  people.push(every_one);
  return (
    <div className="dropdown">
      <div className="dropdown-btn" onClick={e => setIsActive(!isActive)}>
        {selected}
        <span className="fas fa-caret-down"></span>
      </div>
      {isActive && (
        <div className="dropdown-content">
          {people.map(option => (
            <div
              onClick={e => {
                setSelected(getPersonName(option));
                setIsActive(false);
                selectedd = option;
              }}
              className="dropdown-item"
            >
              {getPersonName(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export function getPersonName(person) {
  if (person == "everyone") {
    return person;
  } else {
    return person.profile.displayName;
  }
}
export function getPresences() {
  return selectedd;
}

DropDownChatList.PropTypes = {
  presences: PropTypes.object.isRequired
};

export default DropDownChatList;
