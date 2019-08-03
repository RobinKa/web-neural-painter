import * as tf from "@tensorflow/tfjs"
import React, { useRef } from "react"
import { Button } from "react-bootstrap"
import * as gifshot from "gifshot"

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
let inputImageTime: number = 0
let inputImageRadius: number = 0
let inputImage: any = null

function getInputImage(width: number, height: number, time: number, radius: number) {
    if (inputImageWidth === width && inputImageHeight === height && inputImageTime === time && inputImageRadius === radius) {
        return inputImage
    }

    const image: number[][][] = []
    const halfWidth = width / 2
    const halfHeight = height / 2
    for (let x = 0; x < width; x++) {
        image.push([])
        for (let y = 0; y < height; y++) {
            image[x].push([x - halfWidth, y - halfHeight, radius * Math.cos(2 * Math.PI * time), radius * Math.sin(2 * Math.PI * time)])
        }
    }

    inputImage = tf.tensor4d([image])

    inputImageWidth = width
    inputImageHeight = height
    inputImageTime = time
    inputImageRadius = radius

    return inputImage
}

export function Painter(props: any) {
    const [width, height] = [props.width, props.height]
    const setProgress = props.setProgress
    const setGenerating = props.setGenerating
    const layers = props.layers
    const numHidden = props.numHidden
    const numFrames = props.numFrames
    const radius = props.radius

    const canvas = useRef<HTMLCanvasElement>(null)

    async function generateImage(model: tf.Sequential, time: number) {
        const pred = model.predict(getInputImage(width, height, time, radius)) as tf.Tensor

        const predColors = await pred.array() as number[][][][]

        return predColors[0]
    }

    async function generateModel() {
        setProgress(0)

        const images = []

        const canv = canvas.current!
        const ctx = canv.getContext("2d")!
        const imageData = ctx.createImageData(width, height)
        let time = 0

        function getRandomActivation(): any {
            return activations[Math.floor(Math.random() * activations.length)]
        }

        setGenerating(true)

        const model = tf.sequential()
        const inputShape = [width, height, 4]
        const hiddenShape = [width, height, numHidden]

        for (let i = 0; i < layers - 1; i++) {
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

        for (let frame = 0; frame < numFrames; frame++) {
            const image = await generateImage(model, time)

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

            images.push(canv.toDataURL("image/jpeg", 0.9))

            time += 1 / numFrames

            setProgress(frame / numFrames)
        }

        gifshot.createGIF({
            "images": images
        }, function (obj: any) {
            if (!obj.error) {
                const image = obj.image
                const animatedImage = document.createElement("img")
                animatedImage.src = image
                document.body.appendChild(animatedImage);
            }
        })

        setProgress(1)
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