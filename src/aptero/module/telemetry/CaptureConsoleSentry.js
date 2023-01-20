import { CONSOLE_LEVELS, fill, getGlobalObject, safeJoin, severityFromString } from '@sentry/utils';

const global = getGlobalObject();

/** Send Console API calls as Sentry Events */
export class CaptureConsoleSentry {
    /**
     * @inheritDoc
     */
    static id = 'CaptureConsole';

    /**
     * @inheritDoc
     */
    name = CaptureConsoleSentry.id;

    /**
     * @inheritDoc
     */
    _levels = CONSOLE_LEVELS;

    /**
     * @inheritDoc
     */
    constructor(options = {}) {
        if (options.levels) {
            this._levels = options.levels;
        }
    }

    /**
     * @inheritDoc
     */
    setupOnce(_, getCurrentHub) {
        if (!('console' in global)) {
            return;
        }

        this._levels.forEach((level) => {
            if (!(level in global.console)) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fill(global.console, level, (originalConsoleMethod) => (...args) => {
                const hub = getCurrentHub();

                if (hub.getIntegration(CaptureConsoleSentry)) {
                    hub.withScope(scope => {
                        scope.setLevel(severityFromString(level));
                        scope.setExtra('arguments', args);
                        scope.addEventProcessor(event => {
                            event.logger = 'console';
                            return event;
                        });

                        let message = safeJoin(args, ' ');
                        if (level === 'assert') {
                            if (args[0] === false) {
                                message = `Assertion failed: ${safeJoin(args.slice(1), ' ') || 'console.assert'}`;
                                scope.setExtra('arguments', args.slice(1));
                                hub.captureMessage(message);
                            }
                        } else if (level === 'error' && args[0] instanceof Error) {
                            hub.captureException(args[0]);
                        } else {
                            //hub.captureMessage(message);
                            hub.addBreadcrumb(message);
                        }
                    });
                }

                // this fails for some browsers. :(
                if (originalConsoleMethod) {
                    originalConsoleMethod.apply(global.console, args);
                }
            });
        });
    }
}