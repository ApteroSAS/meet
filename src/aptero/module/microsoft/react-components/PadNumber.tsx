import * as React from "react";
import classNames from "classnames";
import styles from "./link.scss";
import { FormattedMessage } from "react-intl";

const MAX_DIGITS = 6;
const MAX_LETTERS = 4;
const hasTouchEvents = "ontouchstart" in document.documentElement;

interface State {
  entered: string;
  isAlphaMode: boolean;
  failedAtLeastOnce: boolean;
}

function ToggleModeButton(
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLAnchorElement> &
    React.AnchorHTMLAttributes<HTMLAnchorElement>
) {
  return (
    <span>
      <a href="#" {...props}>
        <FormattedMessage id="link-page.toggle-mode-button" defaultMessage="Have a letter code?" />
      </a>
    </span>
  );
}

export class PadNumber extends React.Component<{ execute: (code: string) => void }, State> {
  state: State = {
    entered: "",
    isAlphaMode: false,
    failedAtLeastOnce: false
  };

  buttonRefs: any = {};

  componentDidMount = () => {
    document.addEventListener("keydown", this.handleKeyDown);
    this.attachTouchEvents();
  };

  attachTouchEvents = () => {
    // https://github.com/facebook/react/issues/9809#issuecomment-413978405
    if (hasTouchEvents) {
      for (const [name, ref] of Object.entries(this.buttonRefs)) {
        if (!ref) continue;
        if (name === "remove") {
          (ref as any).ontouchstart = () => this.removeChar();
        } else if (name === "toggle") {
          (ref as any).ontouchstart = () => this.toggleMode();
        } else {
          (ref as any).ontouchstart = () => this.addToEntry(name);
        }
      }
    }
  };

  componentDidUpdate = () => {
    this.attachTouchEvents();
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
  };

  handleKeyDown = (e: KeyboardEvent) => {
    // Number keys 0-9
    if ((e.keyCode < 48 || e.keyCode > 57) && !this.state.isAlphaMode) {
      return;
    }

    // Alpha keys A-I
    if ((e.keyCode < 65 || e.keyCode > 73) && this.state.isAlphaMode) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (this.state.isAlphaMode) {
      this.addToEntry("IHGFEDCBA"[73 - e.keyCode]);
    } else {
      this.addToEntry(e.keyCode - 48);
    }
  };

  toggleMode = () => {
    this.setState({ isAlphaMode: !this.state.isAlphaMode, entered: "", failedAtLeastOnce: false });
  };

  addToEntry = (ch: string | number) => {
    if (this.state.entered.length >= this.maxAllowedChars()) return;
    const newChars = `${this.state.entered}${ch}`;

    this.setState({ entered: newChars }, () => {
      if (this.state.entered.length === this.maxAllowedChars()) {
        try {
          this.props.execute(this.state.entered);
        } catch (e) {
          console.error(e);
          this.setState({ failedAtLeastOnce: true, entered: "" });
        }
      }
    });
  };

  removeChar = () => {
    const entered = this.state.entered;
    if (entered.length === 0) return;
    this.setState({ entered: entered.substring(0, entered.length - 1) });
  };

  render() {
    return (
      <div className={styles.link}>
        <div className={styles.linkContents}>
          <div className={styles.enteredContents}>
            <div className={styles.header}>
              {this.state.failedAtLeastOnce ? (
                <FormattedMessage
                  id="link-page.try-again"
                  defaultMessage="We couldn't find that code.{linebreak}Please try again."
                  values={{ linebreak: <br /> }}
                />
              ) : (
                <FormattedMessage id="link-page.enter-code" defaultMessage="Enter code:" />
              )}
            </div>

            <div className={styles.entered}>
              <input
                className={styles.charInput}
                type={this.state.isAlphaMode ? "text" : "tel"}
                pattern="[0-9A-I]*"
                value={this.state.entered}
                onChange={ev => {
                  if (!this.state.isAlphaMode && ev.target.value.match(/[a-z]/i)) {
                    this.setState({ isAlphaMode: true });
                  }

                  this.setState({ entered: ev.target.value.toUpperCase() }, () => {
                    if (this.state.entered.length === this.maxAllowedChars()) {
                      try {
                        this.props.execute(this.state.entered);
                      } catch (e) {
                        console.error(e);
                        this.setState({ failedAtLeastOnce: true, entered: "" });
                      }
                    }
                  });
                }}
              />
            </div>

            <div className={styles.enteredFooter}>
              {!this.state.isAlphaMode && <ToggleModeButton onClick={() => this.toggleMode()} />}
            </div>
          </div>
          <div className={styles.keypad}>
            {(this.state.isAlphaMode ? ["A", "B", "C", "D", "E", "F", "G", "H", "I"] : [1, 2, 3, 4, 5, 6, 7, 8, 9]).map(
              (d, i) => (
                <button
                  disabled={this.state.entered.length === this.maxAllowedChars()}
                  className={styles.keypadButton}
                  key={`char_${i}`}
                  onClick={() => {
                    if (!hasTouchEvents) this.addToEntry(d);
                  }}
                  ref={r => (this.buttonRefs[d.toString()] = r)}
                >
                  {d}
                </button>
              )
            )}
            <button
              className={classNames(styles.keypadButton, styles.keypadToggleMode)}
              ref={r => (this.buttonRefs["toggle"] = r)}
              onClick={() => {
                if (!hasTouchEvents) this.toggleMode();
              }}
            >
              {this.state.isAlphaMode ? "123" : "ABC"}
            </button>
            {!this.state.isAlphaMode && (
              <button
                disabled={this.state.entered.length === this.maxAllowedChars()}
                className={classNames(styles.keypadButton, styles.keypadZeroButton)}
                ref={r => (this.buttonRefs["0"] = r)}
                onClick={() => {
                  if (!hasTouchEvents) this.addToEntry(0);
                }}
              >
                0
              </button>
            )}
            <button
              disabled={this.state.entered.length === 0 || this.state.entered.length === this.maxAllowedChars()}
              className={classNames(styles.keypadButton, styles.keypadBackspace)}
              ref={r => (this.buttonRefs["remove"] = r)}
              onClick={() => {
                if (!hasTouchEvents) this.removeChar();
              }}
            ></button>
          </div>
        </div>
      </div>
    );
  }

  private maxAllowedChars() {
    return this.state.isAlphaMode ? MAX_LETTERS : MAX_DIGITS;
  }
}
