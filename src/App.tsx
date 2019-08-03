import React, { useState } from 'react';
import './App.css'
import { Painter } from './Painter'
import { ProgressBar } from 'react-bootstrap'
import Slider from 'rc-slider'
import 'bootstrap/dist/css/bootstrap.css'
import 'rc-slider/assets/index.css'

const [defaultWidth, defaultHeight] = [256, 256]
const defaultLayers = 4
const defaultNumHidden = 10
const defaultFrames = 20
const defaultRadius = 100

const App: React.FC = () => {
    const [width, setWidth] = useState(defaultWidth)
    const [height, setHeight] = useState(defaultHeight)
    const [progress, setProgress] = useState(0)
    const [generating, setGenerating] = useState(false)
    const [layers, setLayers] = useState(defaultLayers)
    const [numHidden, setNumHidden] = useState(defaultNumHidden)
    const [frames, setFrames] = useState(defaultFrames)
    const [radius, setRadius] = useState(defaultRadius)

    return (
        <div>
            <div style={{ marginLeft: "20%", marginRight: "20%" }}>
                <h1 style={{ textAlign: "center" }}>Neural Painter</h1>
                <a href="https://github.com/RobinKa/web-neural-painter"><h3 style={{ textAlign: "center" }}>Source Code</h3></a>

                <label style={{ fontSize: "24px", visibility: !generating ? "collapse" : "visible" }}>Generating...</label>
                <ProgressBar animated min={0} max={1} now={progress} label={`${Math.round(progress * 100)}%`} style={{ visibility: !generating ? "collapse" : "visible" }} />
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultWidth} min={0} max={1024} step={16} onChange={value => setWidth(value)} />
                    <label>Width: {width}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultHeight} min={0} max={1024} step={16} onChange={value => setHeight(value)} />
                    <label>Height: {height}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultLayers} min={1} max={50} step={1} onChange={value => setLayers(value)} />
                    <label>Layers: {layers}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultNumHidden} min={1} max={100} step={1} onChange={value => setNumHidden(value)} />
                    <label>Hidden: {numHidden}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultFrames} min={1} max={120} step={1} onChange={value => setFrames(value)} />
                    <label>Frames: {frames}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultRadius} min={0.01} max={500} step={0.01} onChange={value => setRadius(value)} />
                    <label>Radius: {radius}</label>
                </div>
            </div>

            <div style={{ visibility: generating ? "hidden" : "visible", textAlign: "center" }}>
                <Painter width={width} height={height} setProgress={setProgress} setGenerating={setGenerating} layers={layers} numHidden={numHidden} numFrames={frames} radius={radius} />
            </div>
        </div>
    );
}

export default App
