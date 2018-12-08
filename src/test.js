// PIXI test

let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}
PIXI.utils.sayHello(type)

let canvasWidth = 800
let canvasHeight = 450
let params = {
  backgroundColor: 0xFF000011
}
let renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, params)
let elm = document.getElementById('game')
elm.appendChild(renderer.view)

let stage = new PIXI.Container()
renderer.render(stage)


let style = new PIXI.TextStyle({
  fontSize: 24,
  fontWeight: 'normal',
  fill: 0xffffff,
})
let sprite = new PIXI.Text("Hello PIXI.js", style)
sprite.anchor.set(0)
sprite.x = canvasWidth / 2
sprite.y = canvasHeight / 2

stage.addChild(sprite);

renderer.render(stage);

console.log(renderer)
console.log(stage)
console.log(sprite)






