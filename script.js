window.onload = (event) => {
//in case I want to make something run at launch
}

var snapPoints = [];
var rand;
let hexHolder = document.getElementById('allHex');
var allInputs = document.getElementsByClassName('inputs');
Array.from(allInputs).forEach(function(singleInput){
  singleInput.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Focus on the next sibling
      singleInput.nextElementSibling.focus();
      singleInput.nextElementSibling.select();
    }
  });
})

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function sfc32(a, b, c, d) {
    return function() {
      a |= 0; b |= 0; c |= 0; d |= 0; 
      var t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

function setSeed() {
	let seedString = document.getElementById('gameSeed').value;
	var seedHash = cyrb128(seedString);
	rand = sfc32(seedHash[0], seedHash[1], seedHash[2], seedHash[3]);

	//starting code
	populateGrid();
}

const randomHexColorCode = () => {
  let n = (rand() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};

function populateGrid() {
	let totalHexes = 46;
	hexHolder.innerHTML = ``;
	for (let i = 0; i < (totalHexes); i++) {
		let gridDiv = document.createElement(`div`);
		gridDiv.classList.add(`gridElement`);
		hexHolder.append(gridDiv);
    gridDiv.style.backgroundColor = randomHexColorCode();
    let gridBounds = gridDiv.getBoundingClientRect();
    snapPoints.push([(gridBounds.left + gridBounds.right)/2,(gridBounds.top + gridBounds.bottom)/2]); //x,y
	}
  let playerDot = document.createElement(`div`);
  playerDot.classList.add(`player`);
  hexHolder.append(playerDot);
  dragElement(playerDot);
}

function closest(goal, arr) {
	const closest = arr.reduce((prev, curr) => {
	  return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
	});
	return closest;
}


function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    e.target.style.zIndex = 4;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement(event) {
    let playerBounds = elmnt.getBoundingClientRect();
    let playerCenter = [(playerBounds.left + playerBounds.right) / 2, (playerBounds.top + playerBounds.bottom) / 2];
    console.log(findClosestCoord(snapPoints, playerCenter));
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


//Not using this code because i would have to loop through all the elements, going to try snap points instead

// function theseDivsAreGay(input1, input2) {
//   let div1 = input1.getBoundingClientRect();
//   let div1Top = div1.top;
//   let div1Left = div1.left;
//   let div1Right = div1.right;
//   let div1Bottom = div1.bottom;
//   let div1Center = [((div1Left + div1Right) / 2), ((div1Top + div1Bottom) / 2)]; //x, y


//   let div2 = input2.getBoundingClientRect();
//   let div2Top = div2.top;
//   let div2Left = div2.left;
//   let div2Right = div2.right;
//   let div2Bottom = div2.bottom;

//   if (div2Top < div1Center[1] && div2Bottom > div1Center[1]) {
//     let verticalMatch = true;
//   } else{
//     let verticalMatch = false;
//   }

//   if (div2Right > div1Center[0] && div2Left < div1Center[0]) {
//     let horizontalMatch = true;
//   } else {
//     let horizontalMatch = false;
//   }

//   if (horizontalMatch && verticalMatch){
//     return true;
//   } else {
//     return false;
//   }
// }

