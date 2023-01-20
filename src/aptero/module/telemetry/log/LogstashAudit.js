import axios from 'axios'

export class LogstashAudit {

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /** A generated random id for each application-start. */
    sessionId = this.uuidv4();

    /** Timestamp of the session-start. */
    sessionStart = +new Date();

    _userId = "server";

    constructor(tracking_url, origine_url) {
        this.tracking_url = tracking_url;
        this.origine_url = origine_url;
    }

    setUserId(uid) {
        this._userId = uid ? uid : this.sessionId;
    }

    /**
     * Tracks an event.
     * @param event the info of the event. (e.g. "Application Start" or "Click Button Create Project")
     * @param value optional additional information (e.g. the msec it took to start the app)
     */
    track(event, data) {
        return new Promise((resolve, reject) => {
            try {
                let origin = this.origine_url;
                if(data.headers && data.headers.origin){
                    origin = data.headers.origin;
                    delete data.headers["origin"];
                }
                let finalvalue = {
                    event: event,
                    user: this._userId,
                    "headers.origin":  origin,
                    session: this.sessionId,
                    session_duration: (+new Date()) - this.sessionStart,
                    ...data,
                };
                axios.put(this.tracking_url, finalvalue).then(() => {
                    //Do nothing
                }).catch(reason => {
                    reject(reason);
                });
            } catch (err) {
                reject(err);
            }
        })
    }
}
