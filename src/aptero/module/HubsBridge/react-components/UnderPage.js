import React, { useEffect, Component } from "react";
import styles from "./UnderPage.scss";
import { useRoomLoadingState } from "../../../../react-components/room/useRoomLoadingState";
import IframeResizer from "iframe-resizer-react";
import { roomParameters } from "../service/RoomParameters";

function scrollbot() {
  var hash = "underPage";
  document.getElementById(hash).scrollIntoView({
    behavior: "smooth"
  });
  /*
    // Store hash
    var hash = event.srcElement.hash || hash;

    // Using jQuery's animate() method to add smooth page scroll
    // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
    $("html, body").animate({
      scrollTop: $(hash).offset().top
    }, 1000, function() {
      // Add hash (#) to URL when done scrolling (default click behavior)
      window.location.hash = hash;
    });
    window.scroll
  */
}

class UnderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      iframeUrl: "",
      height: "100vh",
      bottomIcon: {
        imgUrl: "",
        right: "0px",
        bottom: "0px",
        width: "0px",
        height: "0px"
      }
    };
  }

  componentDidMount() {
    try {
      roomParameters.getRoomParameters().then(data => {
        if (data && data.underPage)
          this.setState(() => {
            return data.underPage;
          });
      });
    } catch (err) {//no params to expect in some scenarios
    }

    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  render() {
    if (this.state.iframeUrl == "") return <></>;
    const bottomIcon = this.state.bottomIcon;
    return (
      <div
        id="underPage"
        className={styles.underPage}
        style={{
          position: "relative",
          //height: this.state.height,
          marginTop: "100vh",
          width: "1px",
          minWidth: "100%"
        }}
      >
        <a
          onClick={() => scrollbot()}
          style={{
            position: "absolute",
            top: "calc(-" + bottomIcon.bottom + " - " + bottomIcon.height + ")",
            right: bottomIcon.right,
            pointerEvents: "auto"
          }}
        >
          <img id="fleche" width={bottomIcon.width} height={bottomIcon.height} src={bottomIcon.imgUrl} alt="fleche" />
        </a>
        <IframeResizer
          loading="eager"
          src={this.state.iframeUrl}
          style={{
            width: "1px",
            minWidth: "100%",
            border: "none",
            pointerEvents: "auto"
          }}
          maxHeight={this.state.height == 0 ? undefined : this.state.height}
          scrolling={this.state.height == 0 ? "omit" : "yes"}
          heightCalculationMethod="documentElementOffset" //documentElementOffset - documentElementScroll - grow
        ></IframeResizer>
      </div>
    );
  }
}

function UnderPageHooksWrapper() {
  let scene = document.querySelector("a-scene");
  const { loading } = useRoomLoadingState(scene);

  useEffect(() => {
    if (!loading) {
      document.children[0].classList.add(styles.scrollable);
      // setTimeout(e => console.dir(document.querySelector("#underPage")), 100);
    }
  }, [loading]);

  return <UnderPage />;
}
export default UnderPageHooksWrapper;
