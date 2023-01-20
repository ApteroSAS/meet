import React, { Component, useContext } from "react";
import { calculateUncompressedMipmapedTextureSize, isLargeImage } from "../../performance";
import { Modal } from "../../../../../react-components/modal/Modal";
import { Center } from "../../../../../react-components/layout/Center";
import { CloseButton } from "../../../../../react-components/input/CloseButton";
import styles from "./GaugeModal.scss";
import styled from "styled-components";
import PropTypes from "prop-types";
import { bytesToSize } from "../../spoke-utils";

const supTriangle = 24000;
const lowTriangle = 50000;
const MediumTriangle = 50000 * 100;

const supMaterial = 4100;
const lowMaterial = 25;
const MediumMaterial = 25 * 100;


function calculateImageVRAM(image) {
  if (!image) {
    return 0;
  }
  return calculateUncompressedMipmapedTextureSize(image.width, image.height);
}

function recursiveCountLight(node) {
  let count = 0;
  if (node.type.includes("Light")) {
    count++;
    //console.log(node);
  }

  if (node.children) {
    node.children.forEach(element => {
      count += recursiveCountLight(element);
    });
  }
  return count;
}

function calcPerformance(sceneEl) {
  let polygons = null,
    polygonsScore = null,
    totalVRAM = 0,
    texturesScore = null,
    largeTextures = 0,
    largeTexturesScore = null,
    lights = null,
    lightsScore = null,
    uniqueMaterials = null,
    materialsScore = null;

  const jsonscene = sceneEl.object3D.toJSON();

  /*console.dir(sceneEl.object3D);
  console.dir(sceneEl);
  console.dir(jsonscene);
  console.dir(sceneEl.renderer.info);
  console.dir(sceneEl.renderer.state);
*/

  //clonedscene = cloneObject3D(sceneEl.object3D, true);
  //console.log(clonedscene);

  // Calculate Scores

  // let polygonsScore
  polygons = sceneEl.renderer.info.render.triangles;

  if (polygons <= lowTriangle + supTriangle) {
    polygonsScore = "Low";
  } else if (polygons <= MediumTriangle + supTriangle) {
    polygonsScore = "Medium";
  } else {
    polygonsScore = "High";
  }

  // let lightsScore;
  lights = recursiveCountLight(jsonscene.object);

  if (lights <= 3) {
    lightsScore = "Low";
  } else if (lights <= 6) {
    lightsScore = "Medium";
  } else {
    lightsScore = "High";
  }

  // let texturesScore;
/*
  let image = new Image();
  jsonscene.images.forEach(element => {
    image.src = element.url;
    totalVRAM += calculateImageVRAM(image);
    if (isLargeImage(image.width, image.height)) largeTextures++;
  });

  if (totalVRAM <= 268435500) {
    texturesScore = "Low";
  } else if (totalVRAM <= 536870900) {
    texturesScore = "Medium";
  } else {
    texturesScore = "High";
  }
  largeTexturesScore = largeTextures > 0 ? "High" : "Low";
*/
  // let materialsScore;

  let matlist = new Array();
  jsonscene.materials.forEach(element => {
    if (matlist.indexOf(element.uuid) == -1) matlist.push(element.uuid);
  });
  uniqueMaterials = matlist.length;

  if (uniqueMaterials <= lowMaterial + supMaterial) {
    materialsScore = "Low";
  } else if (uniqueMaterials <= MediumMaterial + supMaterial) {
    materialsScore = "Medium";
  } else {
    materialsScore = "High";
  }

  // let fileSizeScore; !!!!!!!!!!!!!!!!!!!
  /*
  if (fileSize < 16777220) {
    fileSizeScore = "Low";
  } else if (fileSize < 52428800) {
    fileSizeScore = "Medium";
  } else {
    fileSizeScore = "High";
  }
*/
  return {
    polygons: {
      value: polygons,
      score: polygonsScore
    },/*
    textures: {
      value: totalVRAM,
      score: texturesScore,
      largeTexturesValue: largeTextures,
      largeTexturesScore
    },*/
    lights: {
      value: lights,
      score: lightsScore
    },
    materials: {
      value: uniqueMaterials,
      score: materialsScore
    }
    /*
    ,
    fileSize: {
      value: fileSize,
      score: fileSizeScore
    }
    */
  };
}

const PerformanceItemContainer = styled.li`
  display: flex;
  border-radius: 4px;
  margin: 4px;
  max-width: 560px;
  align-items: center;

  & > :first-child {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    border-style: solid;
    border-radius: 100px;
    margin: 0.5em;
  }

  & > :last-child {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px;
  }

  h5 {
    font-size: 19px;
  }

  h6 {
    font-size: 16px;
  }

  a {
    white-space: nowrap;
    color: ${props => props.theme.blue};
  }

  p {
    margin: 0;
    font-size: 0.9em;
  }
`;

function PerformanceCheckItem({ scoreTxt, scoreColor, title, description, learnMoreUrl, children }) {
  return (
    <PerformanceItemContainer>
      <div className={styles[scoreColor]}>
        <h5>{scoreTxt}</h5>
      </div>
      <div>
        <h6 className={styles[scoreColor + "Title"]}>
          {title}: {children}
        </h6>
        <p>
          {description}{" "}
          {/*
          <a rel="noopener noreferrer" target="_blank" href={learnMoreUrl}>
            Learn More
          </a>*/}
        </p>
      </div>
    </PerformanceItemContainer>
  );
}

PerformanceCheckItem.propTypes = {
  scoreTxt: PropTypes.string.isRequired,
  scoreColor: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  description: PropTypes.string.isRequired,
  learnMoreUrl: PropTypes.string.isRequired
};

export default class GaugeModal extends Component {
  state = {
    visible: false,
    performance: null,
    scoreToValue: {
      Low: 0,
      Medium: 1,
      High: 2
    }
  };

  async scanForPerf(e) {
    const performance = calcPerformance(this.sceneEl);

    let worstScore = "Low";
    let worstDomain = "None";
    const scores = ["Low", "Medium", "High"];

    //for each object property
    for (const domain in performance) {
      if (Object.hasOwnProperty.call(performance, domain)) {
        const element = performance[domain];

        //If the score is Higher, then the new score is the higher one
        if (scores.indexOf(element.score) > scores.indexOf(worstScore)) {
          worstScore = element.score;
          worstDomain = domain;
        }

        //in the exception of textures, there is a second factor to look for
        if (domain == "textures") {
          if (scores.indexOf(element.largeTexturesScore) > scores.indexOf(worstScore)) {
            worstScore = element.score;
            worstDomain = domain;
          }
        }
      }
    }

    console.log(worstScore, worstDomain);

    //If there is something to worry about
    if (worstScore == "High") {
      const msg = {
        type: "performance_impact_detected",
        data: performance,   
        worstDomain: worstDomain,
        worstScore: worstScore
      };
      setTimeout(a => APP.messageDispatch.receive(msg), 100);
    }

    return Promise.resolve(performance);
  }

  componentDidMount() {
    this.sceneEl = AFRAME.scenes[0];
    /* NOTE : feature disabled for the moment due to reported lag by clients */
    let activated=false;
    if(activated) {
      this.sceneEl.addEventListener("entered", e =>
          this.sceneEl.addEventListener("pinned", f => {
            this.scanForPerf().then(perf => this.setState({performance: perf}));
          })
      );

      this.sceneEl.addEventListener("show_perf_pannel", e => this.setState({visible: true}));
      this.sceneEl.addEventListener("hide_perf_pannel", e => this.setState({visible: false}));
    }
  }

  render() {
    if (!this.state.visible) {
      return <></>;
    }
    console.log(this.state);
    return (
      <Center>
        <Modal
          title="Performance Pannel"
          beforeTitle={<CloseButton onClick={a => this.setState({ visible: false })} />}
          className={styles.gaugeUi}
        >
          <ul>
            <PerformanceCheckItem
              title="Polygon Count"
              description={"We recommend your scene use no more than " + (lowTriangle + supTriangle) +" triangles for mobile devices."}
              learnMoreUrl="https://hubs.mozilla.com/docs/spoke-optimization.html"
              scoreTxt={this.state.performance.polygons.score}
              scoreColor={this.state.performance.polygons.score}
            >
              <span className={this.state.performance.polygons.score }>
                {this.state.performance.polygons.value.toLocaleString()} Triangles
              </span>
            </PerformanceCheckItem>
            <PerformanceCheckItem
              title="Materials"
              description={"We recommend using no more than " + ( lowMaterial + supMaterial ) + "unique materials in your scene to reduce draw calls on mobile devices."}
              learnMoreUrl="https://hubs.mozilla.com/docs/spoke-optimization.html"
              scoreTxt={this.state.performance.materials.score}
              scoreColor={this.state.performance.materials.score}
            >
              <span className={this.state.performance.materials.score}>
                {this.state.performance.materials.value} Unique Materials
              </span>
            </PerformanceCheckItem>{/*
            <PerformanceCheckItem
              title="Textures"
              description="We recommend your textures use no more than 256MB of video RAM for mobile devices. We also recommend against using textures larger than 2048 x 2048."
              learnMoreUrl="https://hubs.mozilla.com/docs/spoke-optimization.html"
              scoreTxt={
                this.state.scoreToValue[this.state.performance.textures.largeTexturesScore] >
                this.state.scoreToValue[this.state.performance.textures.score]
                  ? this.state.performance.textures.largeTexturesScore
                  : this.state.performance.textures.score
              }
              scoreColor={
                this.state.scoreToValue[this.state.performance.textures.largeTexturesScore] >
                this.state.scoreToValue[this.state.performance.textures.score]
                  ? this.state.performance.textures.largeTexturesScore
                  : this.state.performance.textures.score
              }
            >
              <span className={this.state.performance.textures.score}>
                ~{bytesToSize(this.state.performance.textures.value)} Video RAM
              </span>
              ,{" "}
              <span className={this.state.performance.textures.largeTexturesScore}>
                {this.state.performance.textures.largeTexturesValue} Large Textures
              </span>
            </PerformanceCheckItem> */}
            <PerformanceCheckItem
              title="Lights"
              description="While dynamic lights are not enabled on mobile devices, we recommend using no more than 3 lights in your scene (excluding ambient and hemisphere lights) for your scene to run on low end PCs."
              learnMoreUrl="https://hubs.mozilla.com/docs/spoke-optimization.html"
              scoreTxt={this.state.performance.lights.score}
              scoreColor={this.state.performance.lights.score}
            >
              <span className={this.state.performance.lights.score}>
                {this.state.performance.lights.value} Lights
              </span>
            </PerformanceCheckItem>
          </ul>
        </Modal>
      </Center>
    );
  }
}
