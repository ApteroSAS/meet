import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { ReactComponent as PhoneIcon } from "../icons/Phone.svg";
import { ReactComponent as AcountIcon } from "../icons/Acount.svg";
import { ReactComponent as EmailIcon } from "../icons/Email.svg";
import styles from  "./UserProfileVisitCard.scss";

export function UserProfileVisitCard({
                                       displayName,
                                       email,
                                       phoneNumber,
                                       jobTitle,
                                       profilePicture
                                     }) {
  if ((typeof profilePicture === "string") && !profilePicture.startsWith("http") && !profilePicture.startsWith("data:")) {
    profilePicture = "data:image/jpeg;base64, " + profilePicture;
  }
  return (
    <div className={classNames("control-pane")}>
      <div className={classNames(styles.sample_container,styles.card_sample)}>

        <div className={classNames(styles.eCard,styles.eCustomCard)}>
          <div className={classNames(styles.eCardHeader)}>

            <div className={classNames(styles.eAvatar,styles.eAvatarCircle)}>
              {!profilePicture && (
                <AcountIcon className={classNames(styles.acountIcon)}/>
              )}
              {profilePicture && (
                <img src={profilePicture} className={classNames(styles.avatarImage,styles.card_sample)}/>)}
            </div>
            &nbsp;
          </div>
          <div className={classNames(styles.eCardHeader)}>
            <div className={classNames(styles.eCardHeaderCaption,"center")} >
              <div className={classNames(styles.eCardHeaderTitle,"name")}>{displayName}</div>
              <div className={classNames(styles.eCardSubTitle)}>{jobTitle}</div>
            </div>
          </div>
          <div className={classNames(styles.eCardContent)}>
            {phoneNumber &&<div className={classNames(styles.phoneNumber)}><PhoneIcon className={classNames(styles.iconPhone)}/><span
              className={classNames(styles.phoneNumberText)}>
              <FormattedMessage id="user-profile-visit-card-no-data"
                                defaultMessage="Information not provided"/></span></div>}
            {email && <div className={classNames(styles.email)}><EmailIcon className={classNames(styles.iconPhone)}/><span
              className={classNames(styles.emailText)}><FormattedMessage id="user-profile-visit-card-no-data" defaultMessage="Information not provided"/>
            </span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

UserProfileVisitCard.propTypes = {
  displayName: PropTypes.string,
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
  jobTitle: PropTypes.string,
  companyName: PropTypes.string,
  profilePicture: PropTypes.string,
  avatarPreview: PropTypes.string

};
export default UserProfileVisitCard;
