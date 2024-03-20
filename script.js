window.onload = (event) => {
//in case I want to make something run at launch
}

var totalHexes = 74;
var allLocationColors = {"river":`#7aa8dc`, "mountain":`#71797f`, "forest":`#186132`, "valley":`#8b4937`, "desert":`#eccfa2`, "plains":`#88cf78`};
var allLocationFileNames = {1:`River.png`, 2:`Mountain.png`, 3:`Forest.png`, 4:`Valley.png`, 5:`Desert.png`, 6:`Plains.png`};
var allLocationTypes = ["river", "mountain", "forest", "valley", "desert", "plains"];
var pathProgress = 0;
var snapPoints = {};
var divGrid = {};
var tilePath = {};
var snapPointsY = [];
var debugBothPlayers = [];
var possibleCoordsKeyStone = [];
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

//randomization code YOINKED

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

//end randomization code YOINKED

function setSeed() {
	let seedString = document.getElementById('gameSeed').value;
	var seedHash = cyrb128(seedString);
	rand = sfc32(seedHash[0], seedHash[1], seedHash[2], seedHash[3]);

	//starting code
	populateGrid();
}

const randomLocation = () => {
  let randNum = Math.floor(rand() * allLocationTypes.length);
  //let n = (rand() * 0xfffff * 1000000).toString(16);
  //return '#' + n.slice(0, 6);
  return allLocationTypes[randNum];
};

function rgbToHex(r, g, b) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

const randomHexColorCode = () => {
  let allLocationTypes = ["river", "mountain", "forest", "valley", "desert", "plains"];
  let randNum = Math.floor(rand() * 6);
  return allLocationColors[allLocationTypes[randNum]];
};

const randomNumberInside = () => {
  let allLocationFileNames = {"river":`River.png`, "mountain":`Mountain.png`, "forest":`Forest.png`, "valley":`Valley.png`, "desert":`Desert.png`, "plains":`Plains.png`};
  let allLocationTypes = ["river", "mountain", "forest", "valley", "desert", "plains"];
  let randNum = Math.floor(rand() * 6);
  return allLocationFileNames[allLocationTypes[randNum]];
};

function populateGrid() {
	hexHolder.innerHTML = ``;
  let currentY = 0;
  let iteratorY = -1;
  let iteratorX = 0;
  let iteratorXadjuster = 0;
	for (let i = 0; i < (totalHexes); i++) {
		let hexDiv = document.createElement(`div`);
		hexDiv.classList.add(`gridElement`);
		hexHolder.append(hexDiv);
    let gridBounds = hexDiv.getBoundingClientRect();
    // hexDiv.style.backgroundColor = randomHexColorCode();
    // hexDiv.fileName = randomNumberInside();
    if((gridBounds.top + gridBounds.bottom)/2 != currentY) {
      currentY = (gridBounds.top + gridBounds.bottom)/2;
      iteratorY++;
      if(iteratorY % 2 == 0) {
        iteratorXadjuster++;        
      }
      iteratorX = -iteratorXadjuster;

    }
    if (iteratorX > 6 || iteratorX < 0) {
      hexDiv.style.backgroundColor = `transparent`;
      iteratorX++;
      continue;
    }
    hexDiv.adjustedCoord = [iteratorX,iteratorY];
    iteratorX++;
    if(!snapPoints[(gridBounds.top + gridBounds.bottom)/2]) {
      snapPoints[(gridBounds.top + gridBounds.bottom)/2] = [];
    }
    snapPoints[(gridBounds.top + gridBounds.bottom)/2].push((gridBounds.left + gridBounds.right)/2); //x,y
    snapPointsY.push((gridBounds.top + gridBounds.bottom)/2);
    if(iteratorX + iteratorY == 7) {
      possibleCoordsKeyStone.push([`${(gridBounds.left + gridBounds.right)/2}`, `${(gridBounds.top + gridBounds.bottom)/2}`, hexDiv]);
    }
    divGrid[`${(gridBounds.left + gridBounds.right)/2},${(gridBounds.top + gridBounds.bottom)/2}`] = hexDiv;
	}
  snapPointsY = snapPointsY.filter((value, index) => snapPointsY.indexOf(value) === index);   
  generatePath();
  generateTheRestOfTheOwl();
  console.log(tilePath);
  let playerDot = document.createElement(`div`);
  playerDot.classList.add(`player`);
  hexHolder.append(playerDot);
  dragElement(playerDot);
  playerDot.style.left = tilePath.move0[0] - playerDot.clientHeight / 2 + `px`;
  playerDot.style.top = tilePath.move0[1] - playerDot.clientHeight / 2 + `px`;
  closeDragElement({target:playerDot});
}

function generatePath() {
  let tileCounter = 0;
  let lookFrom = [`move0`, `move1`, `move2`, `move3`, `move4`, `move5`, `move6`];
  //let startRandom = Math.floor(rand() * 48);
  //let endRandom = Math.floor(rand() * 48);
  for(i=0;i<3;i++) {
    let possibleCoordsStart = [];
    let possibleCoordsEnd = [];
    for (const coordinate in divGrid) {
      let coordArray = coordinate.split(`,`);
      coordArray.push(divGrid[coordArray]);
      if(i == 0) {
        //0 is start
        if (tileCounter == 0) {
          tilePath[`move0`] = coordArray;
        }
        //48 is end
        if (tileCounter == 48) {
          tilePath[`move6`] = coordArray;
        }
        tileCounter++;        
      } else {

        function checkIfCoordsSame(array) {
          if(array[0] == coordArray[0] && array[1] == coordArray[1]) {
            return true;
          } else {
            return false;
          }          
        }
        if(!(getDistance(coordArray,tilePath[lookFrom[i-1]]) > 6 || getDistance(coordArray,tilePath[lookFrom[i-1]]) == 0 || Object.values(tilePath).some(checkIfCoordsSame))) {
          possibleCoordsStart.push(coordArray);
        }
        if(!(getDistance(coordArray,tilePath[lookFrom[7-i]]) > 6 || getDistance(coordArray,tilePath[lookFrom[7-i]]) == 0 || Object.values(tilePath).some(checkIfCoordsSame))) {
          possibleCoordsEnd.push(coordArray);
        }
      }
    }
    if(i > 0) {
      tilePath[`move${i}`] = possibleCoordsStart[Math.floor(rand() * possibleCoordsStart.length)];
      tilePath[`move${6-i}`] = possibleCoordsEnd[Math.floor(rand() * possibleCoordsEnd.length)];
    }
  }
  //keystone time
  tilePath[`move3`] = possibleCoordsKeyStone[Math.floor(rand() * possibleCoordsKeyStone.length)];
  for (i = 0; i <= 6; i++) {
    //tilePath[lookFrom[i]][2].style.backgroundColor = randomHexColorCode();
    if (i > 0) {
      tilePath[lookFrom[i-1]][2].distanceToNext = getDistance(tilePath[lookFrom[i]],tilePath[lookFrom[i - 1]]);
      tilePath[lookFrom[i-1]][2].nextTile = tilePath[lookFrom[i]];
    }
  }
  let problemChildren = {};
  for (i = 0; i <= 6; i++) {
    let currentTile = tilePath[lookFrom[i]];
    if(!problemChildren[`${currentTile[0]},${currentTile[1]}`]) {
      problemChildren[`${currentTile[0]},${currentTile[1]}`] = [];
    }
    for(let position in tilePath) {
      if(getDistance(currentTile, tilePath[position]) == tilePath[position][2].distanceToNext) {
        if(currentTile != tilePath[position][2].nextTile) {
          problemChildren[`${currentTile[0]},${currentTile[1]}`].push(tilePath[position][2].nextTile);
          let otherChild = tilePath[position][2].nextTile;
          if(!problemChildren[`${otherChild[0]},${otherChild[1]}`]) {
            problemChildren[`${otherChild[0]},${otherChild[1]}`] = [];
          }
          problemChildren[`${otherChild[0]},${otherChild[1]}`].push(currentTile);
        }
      }
    }
  }
  for (i = 0; i <= 6; i++) {
    let currentTile = tilePath[lookFrom[i]];
    if(problemChildren[`${currentTile[0]},${currentTile[1]}`].length) {
      for(const tile of problemChildren[`${currentTile[0]},${currentTile[1]}`]) {
        if(tile[2].style.backgroundColor) {
          let rgbValues = tile[2].style.backgroundColor.replace(`rgb(`, ``).replace(`)`,``).split(`, `);
          let bannedHex = rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]);
          let bannedLocation = getKeyByValue(allLocationColors, bannedHex);
          allLocationTypes = allLocationTypes.filter((value, index) => value != bannedLocation);
        }
      }
      currentTile[2].style.backgroundColor = allLocationColors[randomLocation()];
      allLocationTypes = ["river", "mountain", "forest", "valley", "desert", "plains"];
    } else {
      currentTile[2].style.backgroundColor = randomHexColorCode();
    }
  }

  //problem seed debug: ahwwe

  // for (i = 0; i <= 6; i++) {
  //   if() {
  //     let removedValue = ``;
  //     allLocationTypes = allLocationTypes.filter((value, index) => value != removedValue);  
  //   }
  //   tilePath[lookFrom[i]][2].style.backgroundColor = randomHexColorCode();
  //   allLocationTypes = ["river", "mountain", "forest", "valley", "desert", "plains"];
  //   if (i > 0) {
  //     tilePath[lookFrom[i-1]][2].nextTileColor = tilePath[lookFrom[i]][2].style.backgroundColor;
  //   }
  // }
}

function generateTheRestOfTheOwl() {
  for (const coordinate in divGrid) {
    if(divGrid[coordinate].style.backgroundColor) {
      continue;
    } else {
      for(let position in tilePath) {
        if(getDistance([0,0,divGrid[coordinate]], tilePath[position]) == tilePath[position][2].distanceToNext) {
          let rgbValues = tilePath[position][2].nextTile[2].style.backgroundColor.replace(`rgb(`, ``).replace(`)`,``).split(`, `);
          let bannedHex = rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]);
          let bannedLocation = getKeyByValue(allLocationColors, bannedHex);
          allLocationTypes = allLocationTypes.filter((value, index) => value != bannedLocation);
        }
      }
      divGrid[coordinate].style.backgroundColor = allLocationColors[randomLocation()];
      allLocationTypes = ["river", "mountain", "forest", "valley", "desert", "plains"];
    }
  }
}

function getDistance(start, end) {
  let startCoords = start[2].adjustedCoord;
  let endCoords = end[2].adjustedCoord;
  if(startCoords[1] > endCoords[1]) {
    let tempHolder = startCoords;
    startCoords = endCoords;
    endCoords = tempHolder;
  } else if(startCoords[1] == endCoords[1]) {
    if(startCoords[0] > endCoords[0]) {
      let tempHolder = startCoords;
      startCoords = endCoords;
      endCoords = tempHolder;   
    }
  }
  if(endCoords[0] >= startCoords[0]) {
    let totalDistance = Math.abs(startCoords[1] - endCoords[1]) + Math.abs(startCoords[0] - endCoords[0]);
    return totalDistance;
  } else if(-Math.abs(startCoords[0] - endCoords[0]) + Math.abs(startCoords[1] - endCoords[1]) <= 0) {
    let totalDistance = Math.abs(startCoords[0] - endCoords[0]);
    return totalDistance;
  } else {
    let totalDistance = Math.abs(startCoords[1] - endCoords[1]);
    return totalDistance;
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
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    e.target.style.zIndex = 4;
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.backgroundImage = `none`;
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
}

function closeDragElement(event) {
    let nextColor = document.getElementById(`colorPanel`);
    let playerBounds = event.target.getBoundingClientRect();
    let playerCenter = [(playerBounds.left + playerBounds.right) / 2, (playerBounds.top + playerBounds.bottom) / 2];
    let topLocation = closest(playerCenter[1], snapPointsY);
    let leftLocation = closest(playerCenter[0], snapPoints[topLocation]);
    if(`${leftLocation},${topLocation}` == `${tilePath[`move${pathProgress}`][0]},${tilePath[`move${pathProgress}`][1]}`) {
      if(pathProgress == 6) {
        event.target.style.backgroundColor = `#ffffff`;
        pathProgress = 0;
        nextColor.style.backgroundColor = tilePath[`move${pathProgress}`][2].style.backgroundColor;
      }
      nextColor.style.backgroundColor = tilePath[`move${pathProgress}`][2].nextTile[2].style.backgroundColor;
      event.target.style.backgroundImage = `url("./images/${allLocationFileNames[tilePath[`move${pathProgress}`][2].distanceToNext]}")`;
      event.target.style.backgroundSize = `70%`;
      event.target.style.backgroundRepeat = `no-repeat`;
      event.target.style.backgroundPosition = `center center`;
      pathProgress++;
    } else {
      pathProgress = 0;
      nextColor.style.backgroundColor = tilePath[`move${pathProgress}`][2].style.backgroundColor;
    }

    event.target.style.top = topLocation - event.target.clientHeight / 2 + "px";
    event.target.style.left = leftLocation - event.target.clientWidth / 2  + "px";

    // let player1TopLocation = closest(Number(debugBothPlayers[0].style.top.replace(`px`,``)) + debugBothPlayers[0].clientHeight/2, snapPointsY);
    // let player1LeftLocation = closest(Number(debugBothPlayers[0].style.left.replace(`px`,``)) + debugBothPlayers[0].clientWidth/2, snapPoints[player1TopLocation]);
    // let player2TopLocation = closest(Number(debugBothPlayers[1].style.top.replace(`px`,``)) + debugBothPlayers[1].clientHeight/2, snapPointsY);
    // let player2LeftLocation = closest(Number(debugBothPlayers[1].style.left.replace(`px`,``)) + debugBothPlayers[1].clientWidth/2, snapPoints[player2TopLocation]);


    // console.log(getDistance([0,0,divGrid[`${player1LeftLocation},${player1TopLocation}`]], [0,0,divGrid[`${player2LeftLocation},${player2TopLocation}`]]));
    // console.log(getDistance([0,0,divGrid[`${player2LeftLocation},${player2TopLocation}`]], [0,0,divGrid[`${player1LeftLocation},${player1TopLocation}`]]));

    document.onmouseup = null;
    document.onmousemove = null;
  }
