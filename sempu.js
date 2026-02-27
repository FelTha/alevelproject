const canvas = document.getElementById('mainCanvas')
const topCanvas = document.getElementById('topCanvas')
const cursorCanvas = document.getElementById('cursorCanvas')
const ctx = canvas.getContext('2d')
const topCtx = topCanvas.getContext('2d')
const cursorCtx = cursorCanvas.getContext('2d')
const GLOBWIDTH = 16 // change these if necessary
const GLOBHEIGHT = 9 // change these if necessary



var renderedOnce = false

// these will all be written to once resizedWindow runs
// canvas w/h
var cwidth
var cheight
// tile w/h
var twidth
var theight

function resizedWindow() {
  var w = window.innerWidth
  var h = window.innerHeight
  const gw = GLOBWIDTH
  const gh = GLOBHEIGHT
  
  // check which is the 'limiting factor' for 16x9, and size w & h to fit this
  var wratio = (gh/gw) * w
  var hratio = h
  if (wratio > hratio) {
    w = (gw/gh) * h
  } else {
    h = wratio
  }
  
  // add padding
  w *= 0.9
  h *= 0.9
  
  // make them divisible by 9 and 16 (respectively)
  w = Math.floor(w/gw)*gw
  h = Math.floor(h/gh)*gh
  
  // actually set them
  canvas.width = w
  canvas.height = h
  topCanvas.width = w
  topCanvas.height = h
  cursorCanvas.width = w
  cursorCanvas.height = h
  
  // update the global variables
  cwidth = w
  cheight = h
  twidth = w/GLOBWIDTH
  theight = h/GLOBHEIGHT
  // console.log(w,h)
  // console.log(twidth,theight)
  
  if (renderedOnce === true) {
    renderBaseLayer()
    renderIconLayer()
  }
}

resizedWindow() // one call to size it accordingly when first ran



class Stack {
  constructor(s, o) /*s for size, o for order*/ {
    this.pointer = -1
    this.data = new Array(s)
    this.size = s
    this.order = o
  }
  push(d) /*d for data*/ {
    if (this.pointer == this.size-1) return "stack full"
    this.pointer++
    this.data[this.pointer] = d
  }
  peek() {
    if (this.pointer == -1) return "stack empty"
    return this.data[this.pointer]
  }
  pop() {
    if (this.pointer == -1) return "stack empty"
    const top = this.data[this.pointer]
    this.pointer--
    return top
  }
}

// ⚠️⚠️⚠️ TEMPORARY ⚠️⚠️⚠️
const order = ["3a","3b","3c"]
var plateInfo = {list: [], tilePos: -1}
// ⚠️⚠️⚠️ TEMPORARY ⚠️⚠️⚠️

var orderLen = order.length
var targetStack = new Stack(orderLen)
for (var i = orderLen-1; i >= 0; i--) {
  targetStack.push(order[i])
}




var mouse = {}

document.addEventListener("mousemove", (e) => {
  mouse = {x: e.clientX, y: e.clientY}
  renderCursorLayer()
})



var heldItem = false // if held, heldItem = {code: "abc", tilePos: 123}

document.addEventListener("mousedown", (e) => {  
  // find pos in terms of canvas
  var wOffset = 0.5*(window.innerWidth-cwidth)
  var hOffset = 0.5*(window.innerHeight-cheight)
  var mPos = {x: mouse.x-wOffset, y: mouse.y-hOffset}
  
  // return if out of bounds
  if (mPos.x < 0 || mPos.y < 0 || mPos.x > cwidth || mPos.y > cheight) return
  
  // actual tile clicked on
  var xTPos = Math.floor(mPos.x/twidth)
  var yTPos = Math.floor(mPos.y/theight)
  
  // check if there's a moveable item on this tile
  var tileLocation = yTPos*GLOBWIDTH + xTPos
  var maybeItem = iconLayer[tileLocation]
  if (maybeItem == "--") return // there wasn't one
  
  // all preliminary checks done, set to hold the item's code and pos (as opposed to 'false')
  heldItem = {code: maybeItem, tilePos: tileLocation}
  
  // mark the item as blank on the icon layer
  iconLayer[tileLocation] = "--"
  // subsequently refresh the icon and cursor layer, to essentially transfer the icon
  renderIconLayer()
  renderCursorLayer()
})

document.addEventListener("mouseup", (e) => {
  // if nothing was picked up
  if (!heldItem) return
  
  // find pos in terms of canvas
  var wOffset = 0.5*(window.innerWidth-cwidth)
  var hOffset = 0.5*(window.innerHeight-cheight)
  var mPos = {x: mouse.x-wOffset, y: mouse.y-hOffset}
  
  // return if out of bounds
  if (mPos.x < 0 || mPos.y < 0 || mPos.x > cwidth || mPos.y > cheight) return
  
  // actual tile left click was let go of on
  var xTPos = Math.floor(mPos.x/twidth)
  var yTPos = Math.floor(mPos.y/theight)
  
  
  
  // check if this tile is free on the BASE layer
  var newTileLocation = yTPos*GLOBWIDTH + xTPos
  var maybeFreeTile = levelArrs[2][newTileLocation]
  
  // to account for inner rounded corners / round tiles
  const emptyEnoughTiles = ["1a","1b","1c","1d"]
  const roundEnoughItems = ["3a","3b","3c"]
  const burgerParts = ["3a","3b","3c"]
  
  // subsequent logic
  var baseLayerFree
  if (emptyEnoughTiles.includes(maybeFreeTile)) {
    baseLayerFree = (roundEnoughItems.includes(heldItem.code))
    
  } else if (maybeFreeTile == "04") { // dropped on a plate
    if (targetStack.peek() == heldItem.code) {
      targetStack.pop()
      plateInfo.list.push(heldItem.code)
      if (plateInfo.tilePos == -1) {plateInfo.tilePos = newTileLocation}
      
      heldItem = false
      renderIconLayer()
      renderCursorLayer()
      return // don't put the icon back where it was!
    } else {baseLayerFree = false}
    
  } else {
    baseLayerFree = (maybeFreeTile == "--")
  }
  
  // check if this tile is free on the ICON layer
  maybeFreeTile = iconLayer[newTileLocation]
  var iconLayerFree = (maybeFreeTile == "--")
  
  if (baseLayerFree == true && iconLayerFree == true) {
    // it IS free:
    // put the icon in its new place
    iconLayer[newTileLocation] = heldItem.code
  } else {
    // it ISN'T free:
    // put it back where it came from
    iconLayer[heldItem.tilePos] = heldItem.code
  }
  
  // reset heldItem (item officially dropped)
  heldItem = false
  
  // re-render both layers affected
  renderIconLayer()
  renderCursorLayer()
})



function getSrc(code) {
  const filePath = "images/"
  const srcs = {
    // floors
    "--": "floors/floor1",
    // walls
    "01": "walls/wall1",
      "1a": "walls/wallcorner1",
      "1b": "walls/wallcorner2",
      "1c": "walls/wallcorner3",
      "1d": "walls/wallcorner4",
      "1e": "walls/wallbump1",
      "1f": "walls/wallbump2",
      "1g": "walls/wallbump3",
      "1h": "walls/wallbump4",
    // icons
    "02": "icons/crate",
    "3a": "icons/bottombunv2",
    "3b": "icons/pattyv2",
    "3c": "icons/topbunv2",
    "04": "icons/plate"
  }
  
  if (typeof code === "string") { // passed a code
    return `${filePath}${srcs[code]}.png`
  } else if (typeof code === "object") { // passed an array of codes
    const v = []
    const len = code.length
    for (var i = 0; i < len; i++) {
      v.push(`${filePath}${srcs[code[i]]}.png`)
    }
    return v
  } else if (typeof code === "boolean" && code === true) { // it wants every complete src
    const arr = []
    for (const [_, v] of Object.entries(srcs)) {
      arr.push(`${filePath}${v}.png`)
    }
    return arr
  }
}

/*
asset key:
--    - empty
01    - wall
1a-1d - wall corners 1-4
1e-1h - wall bumps 1-4
02    - crate
3a-3c - burger parts (bottom to top)
04    - plate
*/

const levelArrs = {
  1: [
    "01","01","01","01","01","01","01","01","01","01","01","01","01","01","01","01",
    "01","1a","--","--","--","--","--","--","--","--","--","--","--","--","1b","01",
    "01","--","--","--","--","--","--","--","--","--","--","--","--","--","--","01",
    "01","--","--","--","--","--","--","--","--","--","--","--","--","--","--","01",
    "01","--","--","--","--","--","--","--","--","--","--","--","--","04","--","01",
    "01","--","--","--","--","--","--","--","--","--","--","--","--","--","--","01",
    "01","--","--","--","--","--","--","--","--","--","--","--","--","--","--","01",
    "01","1c","--","--","--","--","--","--","--","--","--","--","--","--","1d","01",
    "01","01","01","01","01","01","01","01","01","01","01","01","01","01","01","01"
  ],
  2: [
    "01","01","01","01","01","01","01","01","01","01","01","01","01","01","01","01",
    "01","1a","--","1b","01","01","01","01","01","01","01","01","01","01","01","01",
    "01","--","--","--","01","01","01","1a","1b","01","--","--","--","1f","01","01",
    "01","1c","--","--","--","--","--","--","--","01","--","--","--","--","1b","01",
    "01","01","1g","--","01","01","01","--","--","01","--","--","--","--","--","01",
    "01","01","1e","--","1f","01","1e","--","--","01","--","--","--","04","--","01",
    "01","1a","--","--","--","--","--","--","--","01","--","--","--","--","--","01",
    "01","1c","--","--","--","--","--","--","1d","01","--","--","--","--","--","01",
    "01","01","01","01","01","01","01","01","01","01","01","01","01","01","01","01"
  ],
}

const iconArrs = {
  1: [
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--"
  ],
  2: [
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","3a","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","3c","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","02","--","--","--",
    "--","--","--","3b","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--",
    "--","--","--","--","--","--","--","--","--","--","--","--","--","--","--","--"
  ]
}

var iconLayer = []

// ⚠️⚠️⚠️ TEMPORARY ⚠️⚠️⚠️
var iconLayer = iconArrs[2]
// ⚠️⚠️⚠️ TEMPORARY ⚠️⚠️⚠️

function renderBaseLayer() {
  ctx.clearRect(0,0,cwidth,cheight)
  // swap codes out for image srcs
  for (var col = 0; col < GLOBHEIGHT; col++) {
    for (var row = 0; row < GLOBWIDTH; row++) {
      
      var code = levelArrs[2][col*GLOBWIDTH + row]
      
      var img = new Image()
      var src = getSrc(code)
      img.src = src
      img.id = code
      
      // draw the floor first, if necessary
      const partialAssets = ["1a","1b","1c","1d","1e","1f","1g","1h","04"]
      if (partialAssets.includes(code)) {
        var tempImg = new Image()
        tempImg.src = getSrc("--")
        ctx.drawImage(tempImg,row*twidth,col*theight,twidth,theight)
      }
      
      ctx.drawImage(img,row*twidth,col*theight,twidth,theight)
    }
  }
}

function renderIconLayer() {
  topCtx.clearRect(0,0,cwidth,cheight)
  // swap codes out for image srcs
  for (var col = 0; col < GLOBHEIGHT; col++) {
    for (var row = 0; row < GLOBWIDTH; row++) {
      
      code = iconLayer[col*GLOBWIDTH + row]
      
      // on the plate
      if (col*GLOBWIDTH + row == plateInfo.tilePos) {
        for (var i = 0; i < orderLen; i++) {
          code = plateInfo.list[i]
          img = new Image()
          img.src = getSrc(code)
          img.id = code
          
          topCtx.drawImage(img,row*twidth,col*theight,twidth,theight)
        }
      }
      
      if (code === "--") continue
      
      img = new Image()
      src = getSrc(code)
      img.src = src
      img.id = code
      
      topCtx.drawImage(img,row*twidth,col*theight,twidth,theight)
    }
  }
}

function renderCursorLayer() {
  cursorCtx.clearRect(0,0,cwidth,cheight)
  
  // find mouse pos in terms of canvas (useful later)
  var wOffset = 0.5*(window.innerWidth-cwidth)
  var hOffset = 0.5*(window.innerHeight-cheight)
  var mPos = {x: mouse.x-wOffset, y: mouse.y-hOffset}
  
  // display icon under mouse (if mouse is held)
  
  if (heldItem != false) {
    code = heldItem.code
    
    // get src of icon
    img = new Image()
    src = getSrc(code)
    img.src = src
    img.id = code
    
    // centre icon instead of putting it at top left
    var iconPos = {x: mPos.x-twidth/2, y: mPos.y-theight/2}

    cursorCtx.drawImage(img,iconPos.x,iconPos.y,twidth,theight)
  }
  
  // render cursor (on TOP of icon)
  
  var cursor = new Image()
  cursor.src = "images/icons/fork.png"
  
  cursorCtx.drawImage(cursor,mPos.x,mPos.y,0.8*theight,0.8*twidth)
  
  document.body.classList.add("cursorHideClass")
}

renderBaseLayer()
renderIconLayer()
renderedOnce = true