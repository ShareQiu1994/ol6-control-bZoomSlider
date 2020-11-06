/* eslint-disable */
import { Control } from "ol/control";
import "./scss/zoomSlider.scss";
import { css } from "./dom";
import * as htmlUtils from "nature-dom-util/src/utils/domUtils";
import * as olCoordinate from "ol/coordinate";

var BZoomSliderControl = /* @__PURE__ */ (function (Control) {
  function BZoomSliderControl(opt_options = {}) {
    var options = opt_options;

    /**
     * 当前分辨率
     * @type {undefined}
     * @private
     */
    this.currentResolution_ = undefined;

    /**
     * 滑块默认方向（默认竖向）
     * @type {number}
     * @private
     */
    this.direction_ = BZoomSliderControl.Direction_.VERTICAL;

    /**
     * 是否正在拖拽
     * @type {boolean}
     * @private
     */
    this.dragging_ = false;

    /**
     * 高度限制
     * @type {number}
     * @private
     */
    this.heightLimit_ = 0;

    /**
     * 宽度限制
     * @type {number}
     * @private
     */
    this.widthLimit_ = 0;

    /**
     * 原始X
     * @type {null}
     * @private
     */
    this.previousX_ = null;

    /**
     * 原始Y
     * @type {null}
     * @private
     */
    this.previousY_ = null;

    /**
     * 计算出的视图大小（边框加边距）
     * @type {null}
     * @private
     */
    this.thumbSize_ = null;

    /**
     * 滑块是否被初始化
     * @type {boolean}
     * @private
     */
    this.sliderInitialized_ = false;

    /**
     * 动画过渡时延
     * @type {number}
     * @private
     */
    this.duration_ =
      opt_options["duration"] !== undefined ? opt_options["duration"] : 200;

    /**
     * @private
     * @type {number}
     */
    this.pixelDelta_ =
      opt_options["pixelDelta"] !== undefined ? opt_options["pixelDelta"] : 128;

    let className =
      opt_options.className !== undefined
        ? opt_options.className
        : "hmap-zoom-slider";
    let element = htmlUtils.create(
      "div",
      className + " " + css.CLASS_UNSELECTABLE
    );
    let translateContent = htmlUtils.create(
      "div",
      "hmap-zoom-slider-translate-content" + " " + css.CLASS_SELECTABLE,
      element
    );
    let silderContent = htmlUtils.create(
      "div",
      "hmap-zoom-slider-content" + " " + css.CLASS_SELECTABLE,
      element
    );

    let translateN = htmlUtils.create(
      "div",
      "hmap-zoom-slider-button hmap-zoom-slider-translate-n" +
        " " +
        css.CLASS_SELECTABLE,
      translateContent
    );
    translateN.setAttribute("title", "向上平移");
    translateN.addEventListener(
      "click",
      this.handletranslateClick_.bind(this, "translateN"),
      false
    );
    let translateS = htmlUtils.create(
      "div",
      "hmap-zoom-slider-button hmap-zoom-slider-translate-s" +
        " " +
        css.CLASS_SELECTABLE,
      translateContent
    );
    translateS.setAttribute("title", "向下平移");
    translateS.addEventListener(
      "click",
      this.handletranslateClick_.bind(this, "translateS"),
      false
    );
    let translateW = htmlUtils.create(
      "div",
      "hmap-zoom-slider-button hmap-zoom-slider-translate-w" +
        " " +
        css.CLASS_SELECTABLE,
      translateContent
    );
    translateW.setAttribute("title", "向左平移");
    translateW.addEventListener(
      "click",
      this.handletranslateClick_.bind(this, "translateW"),
      false
    );
    let translateE = htmlUtils.create(
      "div",
      "hmap-zoom-slider-button hmap-zoom-slider-translate-e" +
        " " +
        css.CLASS_SELECTABLE,
      translateContent
    );
    translateE.setAttribute("title", "向右平移");
    translateE.addEventListener(
      "click",
      this.handletranslateClick_.bind(this, "translateE"),
      false
    );
    let zoomIn = htmlUtils.create(
      "div",
      "hmap-zoom-slider-zoom-in" + " " + css.CLASS_SELECTABLE,
      silderContent
    );
    zoomIn.setAttribute("title", "放大");
    zoomIn.addEventListener(
      "click",
      this.handleZoomClick_.bind(this, 1),
      false
    );
    let zoomOut = htmlUtils.create(
      "div",
      "hmap-zoom-slider-zoom-out" + " " + css.CLASS_SELECTABLE,
      silderContent
    );
    zoomOut.setAttribute("title", "缩小");
    zoomOut.addEventListener(
      "click",
      this.handleZoomClick_.bind(this, -1),
      false
    );

    let slider = htmlUtils.create(
      "div",
      "hmap-zoom-slider-zoom-slider" + " " + css.CLASS_SELECTABLE,
      silderContent
    );
    this.sliderBackgroundTop = htmlUtils.create(
      "div",
      "slider-background-top" + " " + css.CLASS_SELECTABLE,
      slider
    );
    this.sliderBackgroundBottom = htmlUtils.create(
      "div",
      "slider-background-bottom" + " " + css.CLASS_SELECTABLE,
      slider
    );
    let sliderBackgroundMask = htmlUtils.create(
      "div",
      "slider-background-mask" + " " + css.CLASS_SELECTABLE,
      slider
    );
    sliderBackgroundMask.setAttribute("title", "缩放到此级别");
    this.sliderBar = htmlUtils.create(
      "div",
      "slider-bar" + " " + css.CLASS_SELECTABLE,
      slider
    );
    this.sliderBar.setAttribute("title", "滑动缩放地图");

    /**
     * 滑块容器
     * @type {Element}
     */
    this.silderContent = silderContent;
    this.silderContent.addEventListener(
      "pointerdown",
      this.handleDraggerStart_.bind(this),
      false
    );
    this.silderContent.addEventListener(
      "pointermove",
      this.handleDraggerDrag_.bind(this),
      false
    );
    this.silderContent.addEventListener(
      "pointerup",
      this.handleDraggerEnd_.bind(this),
      false
    );
    this.silderContent.addEventListener(
      "click",
      this.handleContainerClick_.bind(this),
      false
    );
    this.sliderBar.addEventListener(
      "click",
      function (event) {
        event.stopPropagation();
      },
      false
    );
    let render = opt_options["render"]
      ? opt_options["render"]
      : BZoomSliderControl.render;

    Control.call(this, {
      element: element,
      render: render,
      target: options.target,
    });
  }

  if (Control) BZoomSliderControl.__proto__ = Control;
  BZoomSliderControl.prototype = Object.create(Control && Control.prototype);
  BZoomSliderControl.prototype.constructor = BZoomSliderControl;

  BZoomSliderControl.prototype.handletranslateClick_ = function handletranslateClick_(
    type,
    event
  ) {
    event.preventDefault();
    let view = this.getMap().getView();
    let mapUnitsDelta = view.getResolution() * this.pixelDelta_;
    let [deltaX, deltaY] = [0, 0];
    switch (type) {
      case "translateN":
        deltaY = mapUnitsDelta;
        break;
      case "translateS":
        deltaY = -mapUnitsDelta;
        break;
      case "translateW":
        deltaX = mapUnitsDelta;
        break;
      case "translateE":
        deltaX = -mapUnitsDelta;
        break;
    }
    let delta = [deltaX, deltaY];
    olCoordinate.rotate(delta, view.getRotation());
    this.pan(view, delta, this.duration_);
  };

  BZoomSliderControl.prototype.handleZoomClick_ = function (delta, event) {
    event.preventDefault();
    this.zoomByDelta_(delta);
  };

  BZoomSliderControl.prototype.zoomByDelta_ = function (delta) {
    let view = this.getMap().getView();
    if (view) {
      const zoom = view.getZoom() + delta;
      view.animate({
        zoom: zoom,
        duration: this.duration_,
      });
    }
  };

  /**
   * 平移地图
   * @param view
   * @param delta
   * @param optDuration
   */
  BZoomSliderControl.prototype.pan = function (view, delta, optDuration) {
    let currentCenter = view.getCenter();
    if (currentCenter) {
      let center = [currentCenter[0] + delta[0], currentCenter[1] + delta[1]];
      if (optDuration) {
        view.animate({
          duration: optDuration,
          // easing: ol.easing.linear,
          center: center,
        });
      } else {
        view.setCenter(center);
      }
    }
  };

  BZoomSliderControl.render = function (mapEvent) {
    if (!mapEvent.frameState) {
      return;
    }
    if (!this.sliderInitialized_) {
      this.initSlider_();
    }
    let res = mapEvent.frameState.viewState.resolution;
    if (res !== this.currentResolution_) {
      this.currentResolution_ = res;
      this.setThumbPosition_(res);
    }
  };

  /**
   * 容器点击事件处理
   * @param event
   * @private
   */
  BZoomSliderControl.prototype.handleContainerClick_ = function (event) {
    let view = this.getMap().getView();
    let relativePosition = this.getRelativePosition_(
      event.offsetX - this.thumbSize_[0] / 2,
      event.offsetY - this.thumbSize_[1] / 2
    );
    let resolution = this.getResolutionForPosition_(relativePosition);
    view.animate({
      resolution: resolution,
      duration: this.duration_,
    });
  };

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  BZoomSliderControl.prototype.handleDraggerStart_ = function (event) {
    if (
      !this.dragging_ &&
      event.target ===
        htmlUtils.getElementsByClassName(".slider-bar", this.silderContent)
    ) {
      // this.getMap().getView().setHint(this.viewHint.INTERACTING, 1)
      this.previousX_ = event.clientX;
      this.previousY_ = event.clientY;
      this.dragging_ = true;
    }
  };

  /**
   * 处理拖动事件
   * @param event
   * @private
   */
  BZoomSliderControl.prototype.handleDraggerDrag_ = function (event) {
    if (this.dragging_) {
      let element = htmlUtils.getElementsByClassName(
        ".slider-bar",
        this.silderContent
      );
      let deltaX =
        event.clientX - this.previousX_ + parseInt(element.style.left, 10);
      let deltaY =
        event.clientY - this.previousY_ + parseInt(element.style.top, 10);
      let relativePosition = this.getRelativePosition_(deltaX, deltaY);
      this.currentResolution_ = this.getResolutionForPosition_(
        relativePosition
      );
      this.getMap().getView().setResolution(this.currentResolution_);
      this.setThumbPosition_(this.currentResolution_);
      this.previousX_ = event.clientX;
      this.previousY_ = event.clientY;
    }
  };

  /**
   * 处理拖拽结束事件
   * @param event
   * @private
   */
  BZoomSliderControl.prototype.handleDraggerEnd_ = function (event) {
    if (this.dragging_) {
      let view = this.getMap().getView();
      // view.setHint(ol.ViewHint.INTERACTING, -1)
      view.animate({
        resolution: this.currentResolution_,
        duration: this.duration_,
      });
      this.dragging_ = false;
      this.previousX_ = undefined;
      this.previousY_ = undefined;
    }
  };

  /**
   * 允许的方向值
   * @type {{VERTICAL: number, HORIZONTAL: number}}
   * @private
   */
  BZoomSliderControl.Direction_ = {
    VERTICAL: 0,
    HORIZONTAL: 1,
  };

  /**
   * 初始化滑块元素
   * @private
   */
  BZoomSliderControl.prototype.initSlider_ = function () {
    let container = this.silderContent;
    let containerSize = {
      width: container.offsetWidth,
      height: container.offsetHeight,
    };
    let thumb = htmlUtils.getElementsByClassName(".slider-bar", container);
    let computedStyle = getComputedStyle(thumb);
    let thumbWidth =
      thumb.offsetWidth +
      parseFloat(computedStyle["marginRight"]) +
      parseFloat(computedStyle["marginLeft"]);
    let thumbHeight =
      thumb.offsetHeight +
      parseFloat(computedStyle["marginTop"]) +
      parseFloat(computedStyle["marginBottom"]);
    this.thumbSize_ = [thumbWidth, thumbHeight];
    if (containerSize.width > containerSize.height) {
      this.direction_ = BZoomSliderControl.Direction_.HORIZONTAL;
      this.widthLimit_ = containerSize.width - thumbWidth;
    } else {
      this.direction_ = BZoomSliderControl.Direction_.VERTICAL;
      this.heightLimit_ = containerSize.height - thumbHeight;
    }
    this.sliderInitialized_ = true;
  };

  /**
   * 计算指针位置（相对于父容器）
   * @param res
   * @private
   */
  BZoomSliderControl.prototype.setThumbPosition_ = function (res) {
    let position = this.getPositionForResolution_(res);
    let thumb = htmlUtils.getElementsByClassName(
      ".slider-bar",
      this.silderContent
    );
    if (this.direction_ === BZoomSliderControl.Direction_.HORIZONTAL) {
      thumb.style.left = this.widthLimit_ * position + "px";
      this.sliderBackgroundBottom.style.width =
        this.widthLimit_ - (this.widthLimit_ * position - 5) + "px";
    } else {
      thumb.style.top = this.heightLimit_ * position + "px";
      this.sliderBackgroundBottom.style.height =
        this.heightLimit_ - (this.heightLimit_ * position - 5) + "px";
    }
  };

  /**
   * 计算相关位置
   * @param res
   * @returns {number}
   * @private
   */
  BZoomSliderControl.prototype.getPositionForResolution_ = function (res) {
    let view = this.getMap().getView();
    if (view) {
      return 1 - this.getValueForResolutionFunction(res);
    }
  };

  /**
   * 获取值
   * @param resolution
   * @param optPower
   * @returns {number}
   */
  BZoomSliderControl.prototype.getValueForResolutionFunction = function (
    resolution,
    optPower
  ) {
    let power = optPower || 2;
    let view = this.getMap().getView();
    let maxResolution = view.getMaxResolution();
    let minResolution = view.getMinResolution();
    let max = Math.log(maxResolution / minResolution) / Math.log(power);
    return Math.log(maxResolution / resolution) / Math.log(power) / max;
  };

  /**
   * 给出x和y偏移量的指针的相对位置
   * @param x
   * @param y
   * @returns {number}
   * @private
   */
  BZoomSliderControl.prototype.getRelativePosition_ = function (x, y) {
    let amount;
    if (this.direction_ === BZoomSliderControl.Direction_.HORIZONTAL) {
      amount = x / this.widthLimit_;
    } else {
      amount = y / this.heightLimit_;
    }
    return Math.min(Math.max(amount, 0), 1);
  };

  /**
   * 计算相关分辨率
   * @param position
   * @returns {number}
   * @private
   */
  BZoomSliderControl.prototype.getResolutionForPosition_ = function (position) {
    let view = this.getMap().getView();
    if (view) {
      return this.getResolutionForValueFunction(1 - position);
    }
  };

  /**
   * 获取分辨率
   * @param value
   * @param optPower
   * @returns {number}
   */
  BZoomSliderControl.prototype.getResolutionForValueFunction = function (
    value,
    optPower
  ) {
    let power = optPower || 2;
    let view = this.getMap().getView();
    let maxResolution = view.getMaxResolution();
    let minResolution = view.getMinResolution();
    let max = Math.log(maxResolution / minResolution) / Math.log(power);
    return maxResolution / Math.pow(power, value * max);
  };

  BZoomSliderControl.prototype.disposeInternal = function () {
    this.silderContent.addEventListener(
      "pointercancel",
      function (event) {},
      false
    );
    BZoomSliderControl.prototype.disposeInternal.call(this);
  };

  return BZoomSliderControl;
})(Control);

export default BZoomSliderControl;
