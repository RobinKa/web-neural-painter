import * as tf from "@tensorflow/tfjs"
import React, { useState, useRef } from "react"
import { Button } from "react-bootstrap";

tf.enableProdMode()

const activations: any = [
    "elu",
    "hardSigmoid",
    "linear",
    "relu",
    "relu6",
    "selu",
    "sigmoid",
    "softmax",
    "softplus",
    "softsign",
    "tanh",
]


export function Painter(props: any) {
    const [width, height] = [props.width, props.height]
    const setProgress = props.setProgress
    const setGenerating = props.setGenerating
    const layers = props.layers
    const numHidden = props.numHidden

    const [currentModel, setCurrentModel] = useState<tf.Sequential | null>(null)
    const canvas = useRef<HTMLCanvasElement>(null)

    async function generateImage(model: tf.Sequential) {
        setProgress(0)

        let colors: number[][] = []

        for (let y = 0; y < height; y++) {
            const coordsX: number[] = []
            const coordsY: number[] = []
            for (let x = 0; x < width; x++) {
                coordsX.push(x - width / 2)
                coordsY.push(y - height / 2)
            }

            const coords = tf.tensor2d([coordsX, coordsY]).transpose()

            const pred = model.predict(coords) as tf.Tensor

            const predColors = await pred.array() as number[][]

            colors = colors.concat(predColors)

            if (y % 10 === 0) {
                setProgress(y / height)
            }
        }

        setProgress(1)

        return colors
    }

    async function generateModel() {
        setGenerating(true)

        const model = tf.sequential()
        const numInput = 2

        function getRandomActivation(): any {
            return activations[Math.floor(Math.random() * activations.length)]
        }

        for (let i = 0; i < layers - 1; i++) {
            model.add(tf.layers.dense({
                units: numHidden,
                inputShape: [i === 0 ? numInput : numHidden],
            }))

            model.add(tf.layers.activation({
                activation: getRandomActivation(),
            }))

            model.add(tf.layers.batchNormalization())
        }

        model.add(tf.layers.dense({ inputShape: layers == 1 ? numInput : numHidden, units: 3 }))
        model.add(tf.layers.activation({
            activation: getRandomActivation(),
        }))

        const image = await generateImage(model)

        const ctx = canvas.current!.getContext("2d")!
        const imageData = ctx.createImageData(width, height)

        for (let i = 0; i < width * height; i++) {
            imageData.data[i * 4 + 0] = Math.floor(255 * image[i][0])
            imageData.data[i * 4 + 1] = Math.floor(255 * image[i][1])
            imageData.data[i * 4 + 2] = Math.floor(255 * image[i][2])
            imageData.data[i * 4 + 3] = 255
        }

        ctx.putImageData(imageData, 0, 0)

        setCurrentModel(model)

        setGenerating(false)
    }

    return (
        <div>
            <canvas ref={canvas} onClick={generateModel} width={width} height={height} style={{ boxShadow: "3px 3px 5px 0px rgba(0,0,0,0.75)" }} />

            <div style={{ textAlign: "center" }}>
                <Button onClick={generateModel}>Generate</Button>
            </div>
        </div>
    )
}