window.onload = (event) => {
//in case I want to make something run at launch
}

var snapPointsX = [];
var snapPointsY = [];
var rand;
let frontDiv = document.getElementById('front');
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

function populateGrid() {
	let gridWidth = 5;
	let gridHeight = 5;
	frontDiv.innerHTML = ``;
	frontDiv.style.gridTemplateColumns = `auto`;
	for (let i = 0; i < gridWidth - 1; i++) {
		frontDiv.style.gridTemplateColumns += ` auto`;
	}
	for (let i = 0; i < (gridWidth*gridHeight); i++) {
		let gridDiv = document.createElement(`div`);
		gridDiv.classList.add(`gridElement`);
		frontDiv.append(gridDiv);
	}

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
    elmnt.sliding = false;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    e.target.style.zIndex = 4;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.startingSnap = [closest(elmnt.style.top, snapPointsY), closest(elmnt.style.left, snapPointsX)];
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
    let topLocation = closest(pos4, snapPointsY);
    let leftLocation = closest(pos3, snapPointsX);
    // if(!elmnt.sliding) {
    // 	if(Math.abs(pos4 - topLocation) > Math.abs(pos3 - leftLocation)) {
    // 		elmnt.sliding = true;
    // 	} else {
    // 		elmnt.sliding = true;
    // 	}
    // }
    // set the element's new position:
    elmnt.style.top = topLocation - (elmnt.clientWidth / 2) - 4 + "px";
    elmnt.style.left = leftLocation - (elmnt.clientHeight / 2) - 4  + "px";
  }

  function closeDragElement(event) {
    let topLocation = closest(event.clientY, snapPointsY);
    let leftLocation = closest(event.clientX, snapPointsX);
    // set the element's new position:
    elmnt.style.top = topLocation - (elmnt.clientWidth / 2) - 4 + "px";
    elmnt.style.left = leftLocation - (elmnt.clientHeight / 2) - 4  + "px";
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

