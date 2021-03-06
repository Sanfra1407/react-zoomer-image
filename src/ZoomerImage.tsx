import React, { Component } from "react";
import "./zoomer.scss";

/**
 * @interface IProps
 * @description Component's props
 */
interface IProps {
  zoomId: string;
  imgSrc: string;
  imgAlt?: string;
  imgTitle?: string;
}

/**
 * @interface IState
 * @description Component's state
 */
interface IState {
  scale: number;
  offsetX: number;
  offsetY: number;
  zoomed: boolean;
  transitioning: boolean;
}

class ZoomerImage extends Component<IProps, IState> {
  state = {
    zoomed: false,
    transitioning: false,
    offsetX: 0,
    offsetY: 0,
    scale: 1
  };

  /**
   * @method _getOffsets
   * @description Function for getting the image coordinates for the animation
   *
   * @returns {any}
   */
  _getOffsets = (): any => {
    const { zoomId } = this.props;
    const halfScreenX: number = window.innerWidth / 2;
    const halfScreenY: number = window.innerHeight / 2;
    const $el: HTMLElement = document.querySelector(
      `#zoomer-${zoomId} .zoomer__img`
    );
    const offsetX: number =
      halfScreenX - $el.getBoundingClientRect().left - $el.clientWidth / 2;
    const offsetY: number =
      halfScreenY - $el.getBoundingClientRect().top - $el.clientHeight / 2;

    const heightRatio: number = window.innerHeight / $el.clientHeight;
    const widthRatio: number = window.innerWidth / $el.clientWidth;
    let scale: number = heightRatio > widthRatio ? widthRatio : heightRatio;
    scale *= 0.8;

    return {
      offsetX,
      offsetY,
      scale
    };
  };

  /**
   * @method zoom
   * @description Function for the zoom effect
   *
   * @returns {void}
   */
  zoom = (): void => {
    const { offsetX, offsetY, scale } = this._getOffsets();

    this.setState(
      prevState => {
        return {
          zoomed: !prevState.zoomed,
          offsetX: !prevState.zoomed ? offsetX : 0,
          offsetY: !prevState.zoomed ? offsetY : 0
        };
      },
      () => {
        this.setState(
          {
            transitioning: true,
            scale: this.state.zoomed ? scale : 1
          },
          () => {
            setTimeout(() => {
              this.setState({
                transitioning: false
              });
            }, 290);
          }
        );
      }
    );

    document
      .querySelector("body")
      .removeEventListener("keydown", this._keyPressListener);
    document.querySelector("body").removeEventListener("wheel", this._zoomOut);
    window.removeEventListener("resize", this._zoomOut);
  };

  /**
   * @method _zoomOut
   * @description Function for removing the zoom
   *
   * @returns {void}
   */
  _zoomOut = (): void => {
    if (this.state.zoomed && !this.state.transitioning) {
      this.zoom();
    }
  };

  /**
   * @method _keyPressListener
   * @description Function to be called when the ESC button is pressed
   *
   * @returns {void}
   */
  _keyPressListener = (e: any): void => {
    if (e.keyCode === 27) {
      this._zoomOut();
    }
  };

  /**
   * @property {HTMLElement} overlay
   * @description HTML Element to add the overlay to the page
   */
  overlay: HTMLElement = null;

  constructor(props) {
    super(props);

    if (!document.querySelector(".zoomer__backdrop--hidden")) {
      this.overlay = document.createElement("div");
      this.overlay.className = "zoomer__backdrop--hidden";
      document.body.appendChild(this.overlay);
    } else {
      this.overlay = document.querySelector(".zoomer__backdrop--hidden");
    }
  }

  componentDidUpdate() {
    this.overlay.className = `${
      this.state.zoomed ? "zoomer__backdrop" : "zoomer__backdrop--hidden"
    }`;
    document.querySelector("body").classList.toggle("zoomer__no-overflow");

    if (this.state.zoomed) {
      document
        .querySelector("body")
        .addEventListener("keydown", this._keyPressListener);
      document.querySelector("body").addEventListener("wheel", this._zoomOut);
      window.addEventListener("resize", this._zoomOut);
    }
  }

  render() {
    const { imgSrc, imgAlt, imgTitle, zoomId } = this.props;

    return (
      <div className="zoomer" id={`zoomer-${zoomId}`}>
        <div
          style={{
            zIndex: this.state.transitioning || this.state.zoomed ? 200 : null,
            transform: `translate(${this.state.offsetX}px, ${
              this.state.zoomed ? this.state.offsetY + "px" : "0"
            })`
          }}
          className={`zoomer__img ${
            this.state.zoomed ? "zoomer__img--zoomed" : ""
          }`}
        >
          <img
            src={imgSrc}
            alt={imgAlt ? imgAlt : null}
            title={imgTitle ? imgTitle : null}
            style={{
              transform: this.state.zoomed ? `scale(${this.state.scale})` : null
            }}
            onClick={this.zoom}
          />
        </div>
      </div>
    );
  }
}

export default ZoomerImage;
