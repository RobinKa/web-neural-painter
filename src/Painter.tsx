import * as tf from "@tensorflow/tfjs"
import React, { useRef } from "react"
import { Button } from "react-bootstrap"

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

let inputImageWidth: number = 0
let inputImageHeight: number = 0
let inputImage: any = null

function getInputImage(width: number, height: number) {
    if (inputImageWidth === width && inputImageHeight === height) {
        return inputImage
    }

    const image: number[][][] = []
    const halfWidth = width / 2
    const halfHeight = height / 2
    for (let x = 0; x < width; x++) {
        image.push([])
        for (let y = 0; y < height; y++) {
            image[x].push([x - halfWidth, y - halfHeight])
        }
    }

    inputImage = tf.tensor4d([image])

    return inputImage
}

export function Painter(props: any) {
    const [width, height] = [props.width, props.height]
    const setProgress = props.setProgress
    const setGenerating = props.setGenerating
    const layers = props.layers
    const numHidden = props.numHidden

    const canvas = useRef<HTMLCanvasElement>(null)

    async function generateImage(model: tf.Sequential) {
        setProgress(0)

        const pred = model.predict(getInputImage(width, height)) as tf.Tensor

        const predColors = await pred.array() as number[][][][]

        setProgress(1)

        return predColors[0]
    }

    async function generateModel() {
        setGenerating(true)

        const model = tf.sequential()
        const inputShape = [width, height, 2]
        const hiddenShape = [width, height, numHidden]

        function getRandomActivation(): any {
            return activations[Math.floor(Math.random() * activations.length)]
        }

        for (let i = 0; i < layers - 1; i++) {
            /*model.add(tf.layers.dense({
                units: numHidden,
                inputShape: [i === 0 ? numInput : numHidden],
            }))*/
            model.add(tf.layers.conv2d({
                kernelSize: [1, 1],
                filters: numHidden,
                inputShape: i === 0 ? inputShape : hiddenShape,
            }))

            model.add(tf.layers.activation({
                activation: getRandomActivation(),
            }))

            model.add(tf.layers.batchNormalization())
        }

        model.add(tf.layers.conv2d({ inputShape: layers === 1 ? inputShape : hiddenShape, filters: 3, kernelSize: [1, 1] }))
        model.add(tf.layers.activation({
            activation: getRandomActivation(),
        }))

        const image = await generateImage(model)

        const ctx = canvas.current!.getContext("2d")!
        const imageData = ctx.createImageData(width, height)

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const i = x + y * width
                imageData.data[i * 4 + 0] = Math.floor(255 * image[x][y][0])
                imageData.data[i * 4 + 1] = Math.floor(255 * image[x][y][1])
                imageData.data[i * 4 + 2] = Math.floor(255 * image[x][y][2])
                imageData.data[i * 4 + 3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)

        setGenerating(false)
    }

    return (
        <div>
            <canvas ref={canvas} onClick={generateModel} width={width} height={height} style={{ boxShadow: "3px 3px 5px 0px rgba(0,0,0,0.75)" }} />

            <div style={{ marginTop: "10px", textAlign: "center" }}>
                <Button onClick={generateModel}>Generate</Button>
            </div>
        </div>
    )
}