import React from "react";
import PropTypes from "prop-types";
import UserProfileVisitCard from "./UserProfileVisitCard";
import {getProfileList} from "../ui-root";
import {usePeopleList} from "./PeopleSidebarContainer";
// get the profile of the selected user
let profileList = [];
let email = "";
let jobTitle = "";
let companyName = "";
let phoneNumber = "";
let profilePicture = "";

export function UserProfileVisitCardContainer({
                                                  mySessionId,
                                                  presences,
                                                  userId,
                                                  displayName,
                                                  avatarPreview
                                              }) {
    const people = usePeopleList(presences, mySessionId);
    const selectedPerson = people.find(person => person.id === userId);
    profileList = getProfileList();
    let selectedPersonProfile = null;
    profileList.map((profile) => {
        if (profile.userId === userId) {
            selectedPersonProfile = profile;
        }
    });
    if (selectedPersonProfile != null) {
        email = selectedPersonProfile.email;
        jobTitle = selectedPersonProfile.jobTitle;
        companyName = selectedPersonProfile.companyName;
        phoneNumber = selectedPersonProfile.phoneNumber;
        if (selectedPersonProfile.microsoftUserprofilePicture) {
            profilePicture = selectedPersonProfile.microsoftUserprofilePicture;
        } else {
            profilePicture = selectedPersonProfile.profilePicture;
        }

    }

    if (selectedPerson) {
        email = selectedPerson.profile.email;
        jobTitle = selectedPerson.profile.jobTitle;
        companyName = selectedPerson.profile.companyName;
        phoneNumber = selectedPerson.profile.phoneNumber;
        if (selectedPerson.profile.microsoftUserprofilePicture) {
            profilePicture = selectedPerson.profile.microsoftUserprofilePicture;
        } else {
            profilePicture = selectedPerson.profile.profilePicture;
        }

    }

    if(!profilePicture){
        profilePicture = avatarPreview;
    }

    return (
        <UserProfileVisitCard
            displayName={displayName}
            email={email}
            phoneNumber={phoneNumber}
            jobTitle={jobTitle}
            companyName={companyName}
            profilePicture={profilePicture}
        />
    );
}

UserProfileVisitCardContainer.propTypes = {
    presences: PropTypes.object,
    mySessionId: PropTypes.string,
    userId: PropTypes.string,
    avatarPreview: PropTypes.string,
    displayName: PropTypes.string,
};
