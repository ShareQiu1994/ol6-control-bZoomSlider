# openlayers6 扩展 zoomSlider 控件

[![NPM](https://nodei.co/npm/ol6-control-bzoomslider.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ol6-control-bzoomslider/)

> 提供地图滑动缩放和平移，支持 openlayers6+ 以上。

## Use

```bash
npm install ol6-control-bzoomslider --save
import BZoomSliderControl from 'ol6-control-bzoomslider'

new Map({
  controls: defaults().extend([
    new BZoomSliderControl()
  ]),
})
// or

npm install ol6-control-bzoomslider --save
import BZoomSliderControl from 'ol6-control-bzoomslider'

map.addControl(new BZoomSliderControl())
```

## Examples

![demo](https://raw.githubusercontent.com/aurorafe/ol-control-bZoomSlider/master/asset/demo.gif)

其他示例请参看 example 文件夹

#### Parameters:

| key          | type       | desc                                       |
| :----------- | :--------- | :----------------------------------------- |
| `className`  | `String`   | 插件 dom 类名，默认值为 `hmap-zoom-slider` |
| `duration`   | `Number`   | 动画过渡时间 ，默认 `200`                  |
| `pixelDelta` | `Number`   | 平移的像素距离，默认 `128`                 |
| `render`     | `Function` | 渲染函数                                   |
| `target`     | `String`   | 目标 dom                                   |
