import p5 from "p5"
import "./styles.scss"

const sketch = (p: p5) => {
  const w = (value: number): number => {
    if (!value) return p.width
    return p.width * value
  }
  const h = (value: number): number => {
    if (!value) return p.height
    return p.height * value
  }

  p.setup = () => {
    const canvas = p.createCanvas(600, 600)
    canvas.parent("p5-canvas")

    //                 Hue  Sat  Bri  Alpha
    //                  v    v    v    v
    p.colorMode(p.HSB, 360, 100, 100, 1.0)
    p.background(0, 0, 0)
    p.noFill()
    p.stroke(0, 0, 100)
    p.strokeWeight(w(0.001))
  }
  p.draw = () => {
    p.clear()
    // for (let r = 0.1; r < 0.4; r += 0.05) {
    //   p.circle(w(0.5), h(0.5), w(r * 2))
    // }

    const nSteps = 3
    const radPerStep = (Math.PI * 2) / nSteps
    let c = 0

    for (let r = 0.1; r < 0.7; r += 0.01) {
      p.stroke(c % 360, 60, 100)
      const circle = makeCircle(20, r)
      const distortedCircle = distortPolygon(p, circle)
      const smoothCircle = chaikin(distortedCircle, 2)

      p.beginShape()
      smoothCircle.forEach((point) => {
        p.vertex(w(point[0]), h(point[1]))
      })
      p.endShape(p.CLOSE)
      c += 10
    }
  }
}

new p5(sketch)

const makeCircle = (nSides: number, r: number): number[][] => {
  const points: number[][] = []
  const radPerStep = (Math.PI * 2) / nSides
  for (let theta = 0; theta < Math.PI * 2; theta += radPerStep) {
    const x = 0.5 + r * Math.cos(theta)
    const y = 0.5 + r * Math.sin(theta)

    points.push([x, y])
  }

  return points
}

const distortPolygon = (p: p5, polygon: number[][]): number[][] => {
  return polygon.map((point) => {
    const x = point[0]
    const y = point[1]
    const distance = p.dist(0.5, 0.5, x, y) // distance from center
    const z = p.frameCount / 200
    const noiseFn = (x: number, y: number) => {
      const noiseX = (x + 0.31) * distance * 2 + z
      const noiseY = (y - 1.74) * distance * 2 + z
      return p.noise(x * distance * 1.5, y * distance * 1.5, p.frameCount / 200)
    }
    const theta = noiseFn(x, y) * Math.PI * 3

    const nudgeBy = 0.08 - Math.sin(p.frameCount / 200) * 0.08
    const newX = x + nudgeBy * Math.cos(theta)
    const newY = y + nudgeBy * Math.sin(theta)

    return [newX, newY]
  })
}

function chaikin(arr: number[][], num: number): number[][] {
  if (num === 0) return arr
  const l = arr.length
  const smooth = arr
    .map((c, i) => {
      return [
        [
          0.75 * c[0] + 0.25 * arr[(i + 1) % l][0],
          0.75 * c[1] + 0.25 * arr[(i + 1) % l][1],
        ],
        [
          0.25 * c[0] + 0.75 * arr[(i + 1) % l][0],
          0.25 * c[1] + 0.75 * arr[(i + 1) % l][1],
        ],
      ]
    })
    .flat()
  return num === 1 ? smooth : chaikin(smooth, num - 1)
}
