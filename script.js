window.onload = (event) => {
//in case I want to make something run at launch
}

var snapPointsX = [];
var snapPointsY = [];
let frontDiv = document.getElementById('front');
var allInputs = document.getElementsByClassName('inputs');
Array.from(allInputs).forEach(function(singleInput){
  singleInput.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13 || singleInput.value.length == 1) {
      // Focus on the next sibling
      singleInput.nextElementSibling.focus();
      singleInput.nextElementSibling.select();
    }
  });
})

function populateGrid() {
	let gridWidth = document.getElementById('gridWidth').value;
	let gridHeight = document.getElementById('gridHeight').value;
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
	var squares = Array.from(document.getElementsByClassName(`gridElement`));
		squares.forEach(function(square){
			let squareEdges = square.getBoundingClientRect();
			snapPointsY.push(squareEdges.top);
			snapPointsX.push(squareEdges.right);
			snapPointsY.push(squareEdges.bottom);
			snapPointsX.push(squareEdges.left);
		});
		snapPointsX = snapPointsX.filter((value, index) => snapPointsX.indexOf(value) === index);
		snapPointsX = snapPointsX.filter((value, index) => {
			let buffer = squares[0].clientHeight / 15;
			if(Math.abs(snapPointsX[index+3] - value) < squares[0].clientHeight - buffer) {
				return false;
			} else {
				return true;
			}
		});
		snapPointsY = snapPointsY.filter((value, index) => snapPointsY.indexOf(value) === index);
		snapPointsY = snapPointsY.filter((value, index) => {
			let buffer = squares[0].clientHeight / 15;
			if(Math.abs(snapPointsY[index+1] - value) < squares[0].clientHeight - buffer) {
				return false;
			} else {
				return true;
			}
		});
		snapPointsY.sort(function(a, b) {
  			return a - b;
		});
		snapPointsX.sort(function(a, b) {
  			return a - b;
		});	
		console.log(snapPointsX,snapPointsY);

	let colorAmount = document.getElementById('gridColors').value;
	for (let i = 0; i < colorAmount; i++) {
		let gridDiv = document.createElement(`div`);
		gridDiv.classList.add(`colorKnob`);
		gridDiv.style.position = `absolute`;
		frontDiv.append(gridDiv);
		gridDiv.style.left = (snapPointsX[i] - gridDiv.clientWidth / 2) - 4 + `px`;
		gridDiv.style.top = (snapPointsY[0] - gridDiv.clientHeight / 2) - 4 + `px`;
		dragElement(gridDiv);
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

