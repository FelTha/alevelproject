const canvas = document.getElementById('mainCanvas')
const ctx = canvas.getContext('2d')
const GLOBWIDTH = 16 // change these if necessary
const GLOBHEIGHT = 9 // change these if necessary



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
  
  // check which is the 'limiting factor' for 16x12, and size w & h to fit this
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
  
  // make them divisible by 12 and 16 (respectively)
  w = Math.floor(w/gw)*gw
  h = Math.floor(h/gh)*gh
  
  // actually set them
  canvas.width = w
  canvas.height = h
  
  // update the global variables
  cwidth = w
  cheight = h
  twidth = w/GLOBWIDTH
  theight = h/GLOBHEIGHT
  // console.log(w,h)
  // console.log(twidth,theight)
}

resizedWindow() // one call to size it accordingly when first ran

function getSrc(code) {
  const filePath = "images/"
  const srcs = {
    // floors
    "0": "floors/floor1",
    // walls
    "1": "walls/wall1",
      "1a": "walls/wallcorner1",
      "1b": "walls/wallcorner2",
      "1c": "walls/wallcorner3",
      "1d": "walls/wallcorner4",
      "1e": "walls/wallbump1",
      "1f": "walls/wallbump2",
      "1g": "walls/wallbump3",
      "1h": "walls/wallbump4",
    // items
    "2": "crate"
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
0     - empty
1     - wall
1a-1d - wall corners 1-4
2     - crate
*/

const levelArrs = {
  1: [
    "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",
    "1","1a", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0","1b", "1",
    "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1",
    "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1",
    "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1",
    "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1",
    "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1",
    "1","1c", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0","1d", "1",
    "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"
  ],
  2: [
    "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",
    "1","1a", "0","1b", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",
    "1", "0", "0", "0", "1", "1", "1","1a","1b", "1", "0", "0", "0","1f", "1", "1",
    "1","1c", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0","1b", "1",
    "1", "1","1g", "0", "1", "1", "1", "0", "0", "1", "0", "0", "0", "0", "0", "1",
    "1", "1","1e", "0","1f", "1","1e", "0", "0", "1", "0", "0", "2", "0", "0", "1",
    "1","1a", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "1",
    "1","1c", "0", "0", "0", "0", "0", "0","1d", "1", "0", "0", "0", "0", "0", "1",
    "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"
  ],
}

function render() {
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
      const partialAssets = ["1a","1b","1c","1d","1e","1f","1g","1h","2"]
      if (partialAssets.includes(code)) {
        var tempImg = new Image()
        var tempSrc = getSrc("0")
        tempImg.src = tempSrc
        ctx.drawImage(tempImg,row*twidth,col*theight,twidth,theight)
      }
      
      ctx.drawImage(img,row*twidth,col*theight,twidth,theight)
    }
  }
}

render()