import { LogstashAudit } from "./LogstashAudit";

export class LoggerClass {
    additionalData = {};
    logstashAudit;
    properties;

    setProperties(data) {
        this.properties = {};
        this.properties.URL = data.URL;
        this.properties.ACTIVATED = data.ACTIVATED;
        this.properties.ORIGIN = data.ORIGIN;
        this.logstashAudit = new LogstashAudit(this.properties.URL, this.properties.ORIGIN);
    }

    start(){
        if (this.deactivated()) {
            console.log("Audit in dev mode");
        } else {
            this.attachUnhandledRejection();
        }
        this.logstashAudit = new LogstashAudit(this.properties.URL, this.properties.ORIGIN);
    }

    constructor() {    }

    attachUnhandledRejection() {
        if (!this.deactivated()) {
            if ((typeof (window) !== 'undefined')) {
                //browser
                window.addEventListener("unhandledrejection", (promiseRejectionEvent) => {
                    promiseRejectionEvent.promise.catch((err) => {
                        // handle error here, for example log
                        this.error("unhandledrejection", {
                            reason: promiseRejectionEvent.reason,
                            err: err
                        });
                    }).catch((err) => {
                        console.error(err);
                    });
                });
                /*//debug unhanded
                new Promise((resolve, reject) => {
                   reject("this error");
                });*/
            }
            if ((typeof (process) !== 'undefined')) {
                //nodejs
                process.on('unhandledRejection', (reason, rejectedPromise) => {
                    rejectedPromise.catch((err) => {
                        // handle error here, for example log
                        this.error("unhandledrejection error", {
                            reason: reason,
                            err: err
                        });
                    }).catch((err) => {
                        console.error(err);
                    });
                });
            }
        }
    }

    setAdditionalData(key, data) {
        this.additionalData[key] = data;
    }

    setUserId(uid) {
        this.logstashAudit.setUserId(uid);
    }

    track(event, data) {
        new Promise(resolve => {
            if (typeof data === "string") {
                data = { datastr: data };
            }
            let finalData = { ...data, ...this.additionalData };
            finalData.message = event;
            if (!this.deactivated()) {
                try {
                    this.logstashAudit.track(event, finalData).catch(() => {
                        //sometime big data in finalData value or strange stringification may cause the event to
                        //not be notified so we always double error event
                        this.logstashAudit.track(event, {}).catch(reason => {
                            console.error(reason);
                            //do nothing to prevent loop of error notification
                        });
                    });
                } catch (err) {
                    //sometime big data in finalData value or strange stringification may cause the event to
                    //not be notified so we always double error event
                    this.logstashAudit.track(event, {}).catch(reason => {
                        console.error(reason);
                        //do nothing to prevent loop of error notification
                    });
                }
            }
            resolve();
        });
    }

    activated() {
        return this.properties.ACTIVATED? (this.properties.ACTIVATED==="true" || this.properties.ACTIVATED===true) : false;
    }

    deactivated() {
        return !this.activated();
    }

    replaceErrors = (key, value) => {
        if (value instanceof Error) {
            let error = {};

            Object.getOwnPropertyNames(value).forEach(function (key) {
                error[key] = value[key];
            });

            return error;
        }

        return value;
    };

    report(event, ...data) {

        let finalData = {
            error: {},
            stack: "stringify error",
        };

        try {
            let stack = new Error().stack;
            finalData.stack = JSON.stringify(stack);
        } catch (e) {
            // do nothing
        }

        try {
            data.forEach((value, index) => {
                finalData.error["" + index] = JSON.stringify(value, this.replaceErrors);
            });
        } catch (e) {
            // do nothing
        }

        if (!this.deactivated()) {
            this.track(event, finalData);
        } else {
            console.error(finalData);
            throw new Error();//display the stack
        }
    }


    reportError(...data) {
        this.error(data);
    }

    error(...data) {
        this.report("log/error", data);
    }

    warn(...data) {
        this.report("log/warn", data);
    }

    log(...data) {
        this.track("log/info", data);
    }

}

