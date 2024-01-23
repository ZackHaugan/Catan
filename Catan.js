


// TODO add option for duplicate numbers per resource (no resource shares duplicate numbers)





// global variables
let controlMenuExpanded = {"Generate":true, "Gameplay":true, "Help":true};
let controlMenuExpandedLookup = ["Generate", "Gameplay", "Help"];

let options = {"MiddleDesert":true, "AdjacentResources":false, "AdjacentNumbers":false, "FairNumbers":true, "AdjacentRedNumbers":false, "FairRedNumbers":false};
let optionsLookup = ["MiddleDesert", "AdjacentResources", "AdjacentNumbers", "FairNumbers", "AdjacentRedNumbers", "FairRedNumbers"];

let rolls = [0,0,0,0,0,0,0,0,0,0,0];

let help = {"IntersectionRank":false};
let helpLookup = ["IntersectionRank"];

let upscale = 2; // the number to multiply the internal canvas dimensions by (higher = better quality)
let dim = Math.floor(upscale * document.getElementById('catanBoard').clientHeight);

// globals that store data of board state
var g_tiles = null;
var g_intersections = null;


function expandAll(){
    for(let i=0;i<controlMenuExpandedLookup.length;i++){
        if(controlMenuExpanded[controlMenuExpandedLookup[i]] == false){
            toggleExpand(i);
        }
    }
}

function collapseAll(){
    for(let i=0;i<controlMenuExpandedLookup.length;i++){
        if(controlMenuExpanded[controlMenuExpandedLookup[i]] == true){
            toggleExpand(i);
        }
    }
}

function toggleExpand(optionHeaderNum){
    let optionHeaderText = controlMenuExpandedLookup[optionHeaderNum];
    let headerImage = document.getElementById("controlBoxOptionHeader"+optionHeaderText).children[0];

    // update image 
    controlMenuExpanded[optionHeaderText] = [false, true][controlMenuExpanded[optionHeaderText]?0:1];
    headerImage.src = ["Images/CollapsedArrow.png", "Images/ExpandedArrow.png"][controlMenuExpanded[optionHeaderText]?1:0];
    headerImage.title = ["Collapse Menu", "Expand Menu"][controlMenuExpanded[optionHeaderText]?0:1];

    //update option visibility
    let options = document.getElementById("controlBoxOptions"+optionHeaderText);
    if(controlMenuExpanded[optionHeaderText]){
        options.classList.remove("hidden");
    } else {
        options.classList.add("hidden");
    }
}

function toggleCheckbox(optionNum){
    let optionDictText = optionsLookup[optionNum];
    options[optionDictText] = [false, true][options[optionDictText]?0:1];
    let optionCheckbox = document.getElementById("controlBoxCheckbox"+optionDictText);

    //update checkbox
    if(options[optionDictText]){
        optionCheckbox.classList.remove("unchecked");
        optionCheckbox.classList.add("checked");
        optionCheckbox.innerHTML = "<p>✖</p>";
    } else {
        optionCheckbox.classList.remove("checked");
        optionCheckbox.classList.add("unchecked");
        optionCheckbox.innerHTML = "";
    }
}

function updateStats(first){
    if(!(first)){
        let rollNum = document.getElementById("controlBoxInputRolledNumber").value;
        if(rollNum >= 2 && rollNum <= 12){
            rolls[rollNum-2] += 1;
            // update text
            let frequencyText = "";
            for(let i=0;i<rolls.length;i++){
                frequencyText += (i+2)+":"+rolls[i];
                if(i<rolls.length-1){
                    frequencyText += ", ";
                }
            }
            document.getElementById("rolledNumberFrequencies").innerText = frequencyText;
            drawRolledNumberChart();
        }
        document.getElementById("controlBoxInputRolledNumber").value = "";
    } else {
        drawRolledNumberChart();
    }
}

function drawRolledNumberChart(){
    // update chart
    let chart = document.getElementById("rolledNumberChart").getContext("2d");
    let sum = 0;
    let expectedRolls = [];
    let probabilities = [1/36, 1/18, 1/12, 1/9, 5/36, 1/6, 5/36, 1/9, 1/12, 1/18, 1/36];
    for(let i=0;i<rolls.length;i++){
        sum += rolls[i];
    }
    sum = sum == 0 ? 1 : sum;
    for(let i=0;i<rolls.length;i++){
        expectedRolls.push(probabilities[i]*sum);
    }

    new Chart(chart, {
        type: 'bar',
        data: {
            labels: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            datasets: [{
                label: 'Actual Rolls',
                data: rolls,
                backgroundColor: 'rgba(35, 48, 89, .5)',
                borderColor: 'rgba(35, 48, 89, 1)',
                borderWidth: 1
            }, {
                label: 'Expected Rolls',
                data: expectedRolls,
                type: 'line',
                lineTension: 0
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {enabled: false},
            events: [],
            aspectRatio:1.5,
        }
    });
}

// show empty roll table
updateStats(true);

// add enter key listener for updating table
document.getElementById("controlBoxInputRolledNumber")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.key === "Enter") {
        updateStats(false);
    }
});

// add listener for generating board (g key)
window.addEventListener("keyup", function(event) {
    event.preventDefault();
    switch (event.key) {
        case "g":
            generateBoard();
            break;
        case "h":
            toggleAllHelp();
            break;
        case "c":
            collapseAll();
            break;
        case "e":
            expandAll();
            break;
        default:
            break;
    }
});

window.addEventListener('resize', () => {
    dim = Math.floor(upscale * document.getElementById('catanBoard').clientHeight);
    drawBoard();
});




// function to manage conversion of normal cordinates to canvas cordinates
function convert(width, height){
    // each catan hexagon is defined to have a unit side length, oriented so that the 'top' and 'bottom' sides are horizontal
    // the origin is 0,0

    let maxVerticalDim = 4.25;
    let maxHorizontalDim = maxVerticalDim * (13 / 12);

    let newHeight = dim * ((height - maxVerticalDim) / (maxVerticalDim * -2));
    let newWidth = dim * ((width + maxHorizontalDim) / (maxVerticalDim * 2));
    return {width:newWidth, height:newHeight};
}

// handle canvas board generation
function generateBoard(){
    if (g_tiles != null){
        let confirm = window.confirm("Are you sure you want to overwrite your existing board?");
        if(!confirm){
            return;
        }
    } else {
        // running for first time
        document.getElementById("catanBoard").style.boxShadow = "0px 5px 10px -5px #000000";
    }
    let canvas = document.getElementById('catanBoard');
    canvas.width = Math.floor(canvas.clientWidth * upscale);
    canvas.height = Math.floor(canvas.clientHeight * upscale);
    let ctx = canvas.getContext('2d');

    // calculate the a tile layout that satisfies all of the options
    calculateTiles();

    // calculate the numbers that satisfy all of the options
    calculateNumbers();

    // calculate intersection stats
    computeIntersections();

    // draw the board
    drawBoard();
}

function drawBoard(){
    if (g_tiles == null){
        return;
    }
    let canvas = document.getElementById('catanBoard');
    canvas.width = Math.floor(canvas.clientWidth * upscale);
    canvas.height = Math.floor(canvas.clientHeight * upscale);
    let ctx = document.getElementById('catanBoard').getContext('2d');
    // (1) draw background

    // fill with blue background
    ctx.fillStyle = '#A0EAF2';
    ctx.fillRect(0,0,dim*(13 / 12),dim);
    
    // coordinates of the centers of each of the hexagons
    let centers = [{'width': -1.7320508075688772, 'height': 3.0}, {'width': 0.0, 'height': 3.0}, {'width': 1.7320508075688772, 'height': 3.0}, {'width': -2.598076211353316, 'height': 1.5}, {'width': -0.8660254037844388, 'height': 1.5}, {'width': 0.8660254037844384, 'height': 1.5}, {'width': 2.5980762113533156, 'height': 1.5}, {'width': -3.4641016151377544, 'height': 0.0}, {'width': -1.7320508075688772, 'height': 0.0}, {'width': 0.0, 'height': 0.0}, {'width': 1.7320508075688772, 'height': 0.0}, {'width': 3.4641016151377544, 'height': 0.0}, {'width': -2.598076211353316, 'height': -1.5}, {'width': -0.8660254037844388, 'height': -1.5}, {'width': 0.8660254037844384, 'height': -1.5}, {'width': 2.5980762113533156, 'height': -1.5}, {'width': -1.7320508075688772, 'height': -3.0}, {'width': 0.0, 'height': -3.0}, {'width': 1.7320508075688772, 'height': -3.0}];

    // draw all hexagon backgrounds
    ctx.strokeStyle = "black";
    ctx.lineWidth = Math.floor(0.5 * upscale);
    ctx.fillStyle = '#ECD799';
    centers.forEach(function(center) {
        let angle = Math.PI / 3;

        ctx.beginPath();
        let actual = convert(center.width, center.height + 1);
        ctx.moveTo(actual.width, actual.height);

        for (let i = 1; i <= 6; i++) {
            let actual = convert(center.width + Math.sin(angle * i), center.height + Math.cos(angle * i));
            ctx.lineTo(actual.width, actual.height);
            
        }

        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    });

    // (2) draw calculated tile layout
    let scale = 0.9;
    let colors = {'B':"#ab6d32", 'O':"#7b717a", 'L':"#475e32", 'W':"#7caa30", 'G':"#dfb53d", 'D':"#c2a563"};
    ctx.strokeStyle = "black";
    ctx.lineWidth = Math.floor(0.5 * upscale);
    let i = 0;
    centers.forEach(function(center) {
        ctx.fillStyle = colors[g_tiles[i]["resource"]];
        let angle = Math.PI / 3;

        ctx.beginPath();
        let actual = convert(center.width, center.height + scale);
        ctx.moveTo(actual.width, actual.height);

        for (let i = 1; i <= 6; i++) {
            let actual = convert(center.width + scale * Math.sin(angle * i), center.height + scale * Math.cos(angle * i));
            ctx.lineTo(actual.width, actual.height);
        }

        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        i++
    });

    // (3) draw calculated numbers layout
    let circleRadius = 0.3;
    i = 0;
    centers.forEach(function(center) {
        if (g_tiles[i]["number"] != 0){
            // draw circle
            ctx.strokeStyle = "black";
            ctx.lineWidth = Math.floor(0.5 * upscale);
            ctx.fillStyle = '#ECD799';
        
            let actual = convert(center.width, center.height);
            let actualRadius = convert(center.width + circleRadius, center.height).width - actual.width;
            ctx.beginPath();
            ctx.arc(actual.width, actual.height, actualRadius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // draw number
            if (g_tiles[i]["number"] == 6 || g_tiles[i]["number"] == 8){
                ctx.fillStyle = '#c81f17';
            } else {
                ctx.fillStyle = 'black';
            }
            // need 
            // 0-24  less likely - more likely
            
            ctx.font = `700 ${Math.floor(dim/(42-21*((5 - Math.abs(7 - g_tiles[i]["number"]))/4))).toString()}px Garamond`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw the centered number
            ctx.fillText(g_tiles[i]["number"].toString(), actual.width, actual.height);


            // draw the dots
            let dotString = '•'.repeat(6 - Math.abs(7 - g_tiles[i]["number"]));
            let dotCoords = convert(center.width, center.height - circleRadius*(0.4+0.25*((5 - Math.abs(7 - g_tiles[i]["number"]))/4)));
            ctx.font = `700 ${Math.floor(dim/60).toString()}px Garamond`;

            ctx.fillText(dotString, dotCoords.width, dotCoords.height);
        }
        i++
    });
    drawAllActiveHelp();
}

function calculateNumbers(){
    // there are only four options that involve number placements
    let adjacentNumbers = options["AdjacentNumbers"];
    let fairNumbers = options["FairNumbers"];
    let adjacentRedNumbers = options["AdjacentRedNumbers"];
    let fairRedNumbers = options["FairRedNumbers"];
    let desertIndex = 0;

    // figure out where the desert tile is:
    for (desertIndex = 0; desertIndex < g_tiles.length; desertIndex++) {
        if(g_tiles[desertIndex]["resource"] == 'D'){
            break;
        }
    }

    let numbers = [2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12];

    let adjacencyList = [
            new Set([]), new Set([0]), new Set([1]), 
        new Set([0]), new Set([0,1,3]), new Set([1,2,4]), new Set([2,5]),
    new Set([3]), new Set([3,4,7]), new Set([4,5,8]), new Set([5,6,9]), new Set([6,10]),
        new Set([7,8]), new Set([8,9,12]), new Set([9,10,13]), new Set([10,11,14]),
            new Set([12,13]), new Set([13,14,16]), new Set([14,15,17])
    ];



    let calculated = false;
    while (!calculated) {

        // assume that we are good
        calculated = true;

        // shuffle the numbers
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Swap array[i] and array[j]
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        // add '0' to desert location
        numbers.splice(desertIndex, 0, 0);

        // do checks

        // adjacent numbers (allows same numbers to be next to each other)
        if (!adjacentNumbers){
            // need to check that adjacent numbers are not equal
            let i = 0;
            while (i < 19){
                if (i == desertIndex){
                    i++;
                    if (i == 19){
                        break;
                    }
                }

                adjacencyList[i].forEach(element => {
                    if (numbers[element] == numbers[i]){
                        calculated = false;
                    }
                });
                if(!calculated){
                    break;
                }
                i++;
            }
        }

        if (!calculated){
            numbers.splice(desertIndex, 1);
            continue;
        }

        // fair numbers (if true, makes each resource roughly equally likely to be rolled)
        if(fairNumbers){
            let sums = {'B':0, 'O':0, 'L':0, 'W':0, 'G':0};
            for (let index = 0; index < numbers.length; index++) {
                if (index == desertIndex){
                    continue;
                }
                sums[g_tiles[index]["resource"]] += 6 - Math.abs(7 - numbers[index]);
            }

            // 
            Object.values(sums).forEach(value => {
                if (value != 11 && value != 12){
                    calculated = false;
                }
            });
        }

        if (!calculated){
            numbers.splice(desertIndex, 1);
            continue;
        }

        // fair red numbers (if true, no resource can have more than one red number)
        if(fairRedNumbers){
            let tilesWithRed = new Set([]);
            for (let index = 0; index < numbers.length; index++) {
                if(numbers[index] == 6 || numbers[index] == 8){
                    if(tilesWithRed.has(g_tiles[index]["resource"])){
                        calculated = false;
                        break;
                    } else {
                        tilesWithRed.add(g_tiles[index]["resource"]);
                    }
                }
                
            }
        }

        if (!calculated){
            numbers.splice(desertIndex, 1);
            continue;
        }

        if(!adjacentRedNumbers){
            let i = 0;
            while (i < 19){
                if(numbers[i] == 6 || numbers[i] == 8){
                    adjacencyList[i].forEach(element => {
                        if (numbers[element] == 6 || numbers[element] == 8){
                            calculated = false;
                        }
                    });
                    if(!calculated){
                        break;
                    }
                }
                i++;
            }
        }
        if (!calculated){
            numbers.splice(desertIndex, 1);
            continue;
        }

        calculated = true;
    }

    // copy over number array to global var
    for(let i = 0; i < g_tiles.length; i++){
        g_tiles[i]["number"] = numbers[i];
    }
}

function calculateTiles(){
    // there are only two options that involve tile placements
    let middleDesert = options["MiddleDesert"];
    let adjacentResources = options["AdjacentResources"];
    let calculated = false;

    while (!calculated) {
        g_tiles = Array.from({ length: 19 }, () => null);
        
        // place desert 
        if (middleDesert){
            g_tiles[9] = {"resource":'D', "number":0};
        } else {
            g_tiles[Math.floor(Math.random() * 19)] = {"resource":'D', "number":0};
        }

        // create dict of available resources (Brick, Ore, Lumber, Wool, Grain)
        
        if(adjacentResources){
            let resources = ['B','B','B','O','O','O','L','L','L','L','W','W','W','W','G','G','G','G'];
            let i = 0;
            while (i < 19){
                if (g_tiles[i] != null){
                    i++;
                    if (i == 19){
                        break;
                    }
                }
                let randIndex = Math.floor(Math.random() * resources.length);
                g_tiles[i] = {"resource":resources[randIndex], "number":0};
                resources.splice(randIndex, 1);
                i++;
            }
            calculated = true;
        } else {
            let resources = {'B':3, 'O':3, 'L':4, 'W':4, 'G':4};
            let adjacencyList = [
                        new Set([]), new Set([0]), new Set([1]), 
                    new Set([0]), new Set([0,1,3]), new Set([1,2,4]), new Set([2,5]),
                new Set([3]), new Set([3,4,7]), new Set([4,5,8]), new Set([5,6,9]), new Set([6,10]),
                    new Set([7,8]), new Set([8,9,12]), new Set([9,10,13]), new Set([10,11,14]),
                        new Set([12,13]), new Set([13,14,16]), new Set([14,15,17])
            ];

            let i = 0;
            let choices = [];
            let totalCount = 0;
            let randIndex = 0;
            while (i < 19){
                if (g_tiles[i] != null){
                    i++;
                    if (i == 19){
                        calculated = true;
                        break;
                    }
                }
                // make set of resources to not consider for this tile
                let bordering = new Set([]);
                adjacencyList[i].forEach(element => {
                    bordering.add(g_tiles[element]["resource"]);
                });

                // make array of choices
                choices = [];
                totalCount = 0;
                Object.entries(resources).forEach(([resource, count]) => {
                    if (!bordering.has(resource)){
                        for (let index = 0; index < count; index++) {
                            choices.push(resource);
                        }
                        totalCount += count;
                    }
                });
                if (totalCount == 0){
                    break;
                }
                randIndex = Math.floor(Math.random() * totalCount);
                g_tiles[i] = {"resource":choices[randIndex], "number":0};
                resources[choices[randIndex]]--;
                
                i++;
                if (i == 19){
                    calculated = true;
                }
            }
        }
    }
}

function computeIntersections(){
    
    g_intersections = [
        {"tiles":[0], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[1,8], "rank":0, coordinates:{'width': -2.598076211353316, 'height': 3.5}},
        {"tiles":[0], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[0,2], "rank":0, coordinates:{'width': -1.7320508075688774, 'height': 4.0}},
        {"tiles":[0,1], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[1,3,10], "rank":0, coordinates:{'width': -0.8660254037844388, 'height': 3.5}},
        {"tiles":[1], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[2,4], "rank":0, coordinates:{'width': -2.220446049250313e-16, 'height': 4.0}},
        {"tiles":[1,2], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[3,5,12], "rank":0, coordinates:{'width': 0.8660254037844384, 'height': 3.5}},
        {"tiles":[2], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[4,6], "rank":0, coordinates:{'width': 1.732050807568877, 'height': 4.0}},
        {"tiles":[2], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[5,14], "rank":0, coordinates:{'width': 2.5980762113533156, 'height': 3.5}},

        {"tiles":[3], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[8,17], "rank":0, coordinates:{'width': -3.4641016151377544, 'height': 2}},
        {"tiles":[0,3], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[0,7,9], "rank":0, coordinates:{'width': -2.598076211353316, 'height': 2.5}},
        {"tiles":[0,3,4], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[8,10,19], "rank":0, coordinates:{'width': -1.7320508075688774, 'height': 2.0}},
        {"tiles":[0,1,4], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[2,9,11], "rank":0, coordinates:{'width': -0.8660254037844388, 'height': 2.5}},
        {"tiles":[1,4,5], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[10,12,21], "rank":0, coordinates:{'width': -2.220446049250313e-16, 'height': 2.0}},
        {"tiles":[1,2,5], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[4,11,13], "rank":0, coordinates:{'width': 0.8660254037844384, 'height': 2.5}},
        {"tiles":[2,5,6], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[12,14,23], "rank":0, coordinates:{'width': 1.732050807568877, 'height': 2.0}},
        {"tiles":[2,6], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[6,13,15], "rank":0, coordinates:{'width': 2.5980762113533156, 'height': 2.5}},
        {"tiles":[6], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[14,25], "rank":0, coordinates:{'width': 3.4641016151377544, 'height': 2.0}},

        {"tiles":[7], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[17,27], "rank":0, coordinates:{'width': -4.330127018922193, 'height': 0.5}},
        {"tiles":[3,7], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[7,16,18], "rank":0, coordinates:{'width': -3.4641016151377544, 'height': 1.0}},
        {"tiles":[3,7,8], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[17,19,29], "rank":0, coordinates:{'width': -2.598076211353316, 'height': 0.5}},
        {"tiles":[3,4,8], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[9,18,20], "rank":0, coordinates:{'width': -1.7320508075688774, 'height': 1.0}},
        {"tiles":[4,8,9], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[19,21,31], "rank":0, coordinates:{'width': -0.8660254037844388, 'height': 0.5}},
        {"tiles":[4,5,9], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[11,20,22], "rank":0, coordinates:{'width': -2.220446049250313e-16, 'height': 1.0}},
        {"tiles":[5,9,10], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[21,23,33], "rank":0, coordinates:{'width': 0.8660254037844384, 'height': 0.5}},
        {"tiles":[5,6,10], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[13,22,24], "rank":0, coordinates:{'width': 1.732050807568877, 'height': 1.0}},
        {"tiles":[6,10,11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[23,25,35], "rank":0, coordinates:{'width': 2.5980762113533156, 'height': 0.5}},
        {"tiles":[6,11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[15,24,26], "rank":0, coordinates:{'width': 3.4641016151377544, 'height': 1.0}},
        {"tiles":[11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[25,37], "rank":0, coordinates:{'width': 4.330127018922193, 'height': 0.5}},

        {"tiles":[7], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[16,28], "rank":0, coordinates:{'width': -4.330127018922193, 'height': -0.5}},
        {"tiles":[7,12], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[27,29,38], "rank":0, coordinates:{'width': -3.4641016151377544, 'height': -1.0}},
        {"tiles":[7,8,12], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[18,28,30], "rank":0, coordinates:{'width': -2.598076211353316, 'height': -0.5}},
        {"tiles":[8,12,13], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[29,31,40], "rank":0, coordinates:{'width': -1.7320508075688774, 'height': -1.0}},
        {"tiles":[8,9,13], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[20,30,32], "rank":0, coordinates:{'width': -0.8660254037844388, 'height': -0.5}},
        {"tiles":[9,13,14], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[31,33,42], "rank":0, coordinates:{'width': -2.220446049250313e-16, 'height': -1.0}},
        {"tiles":[9,10,14], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[22,32,34], "rank":0, coordinates:{'width': 0.8660254037844384, 'height': -0.5}},
        {"tiles":[10,14,15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[33,35,44], "rank":0, coordinates:{'width': 1.732050807568877, 'height': -1.0}},
        {"tiles":[10,11,15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[24,34,36], "rank":0, coordinates:{'width': 2.5980762113533156, 'height': -0.5}},
        {"tiles":[11,15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[35,37,46], "rank":0, coordinates:{'width': 3.4641016151377544, 'height': -1.0}},
        {"tiles":[11], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[26,36], "rank":0, coordinates:{'width': 4.330127018922193, 'height': -0.5}},

        {"tiles":[12], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[28,39], "rank":0, coordinates:{'width': -3.4641016151377544, 'height': -2}},
        {"tiles":[12,16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[38,40,47], "rank":0, coordinates:{'width': -2.598076211353316, 'height': -2.5}},
        {"tiles":[12,13,16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[30,39,41], "rank":0, coordinates:{'width': -1.7320508075688774, 'height': -2.0}},
        {"tiles":[13,16,17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[40,42,49], "rank":0, coordinates:{'width': -0.8660254037844388, 'height': -2.5}},
        {"tiles":[13,14,17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[32,41,43], "rank":0, coordinates:{'width': -2.220446049250313e-16, 'height': -2.0}},
        {"tiles":[14,17,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[42,44,51], "rank":0, coordinates:{'width': 0.8660254037844384, 'height': -2.5}},
        {"tiles":[14,15,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[34,43,45], "rank":0, coordinates:{'width': 1.732050807568877, 'height': -2.0}},
        {"tiles":[15,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[44,46,53], "rank":0, coordinates:{'width': 2.5980762113533156, 'height': -2.5}},
        {"tiles":[15], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[36,45], "rank":0, coordinates:{'width': 3.4641016151377544, 'height': -2.0}},

        {"tiles":[16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[39,48], "rank":0, coordinates:{'width': -2.598076211353316, 'height': -3.5}},
        {"tiles":[16], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[47,49], "rank":0, coordinates:{'width': -1.7320508075688774, 'height': -4.0}},
        {"tiles":[16,17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[41,48,50], "rank":0, coordinates:{'width': -0.8660254037844388, 'height': -3.5}},
        {"tiles":[17], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[49,51], "rank":0, coordinates:{'width': -2.220446049250313e-16, 'height': -4.0}},
        {"tiles":[17,18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[43,50,52], "rank":0, coordinates:{'width': 0.8660254037844384, 'height': -3.5}},
        {"tiles":[18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[51,53], "rank":0, coordinates:{'width': 1.732050807568877, 'height': -4.0}},
        {"tiles":[18], "resourcesPerRoll":0, "structure":null, "buildable":true, "adjacent":[45,52], "rank":0, coordinates:{'width': 2.5980762113533156, 'height': -3.5}}
    ];

    

    g_intersections.forEach(intersection => {
        for (let i = 0; i < intersection["tiles"].length; i++) {
            if(g_tiles[intersection["tiles"][i]]["number"] != 0){
                intersection["resourcesPerRoll"] += 6 - Math.abs(7 - g_tiles[intersection["tiles"][i]]["number"]);
            }
        }
        intersection["resourcesPerRoll"] /= 36;
    });

    calculateIntersectionRanks();
}

function calculateIntersectionRanks(){
    // Create a copy of the array
    let sortedArray = g_intersections.slice();

    // Sort the copy based on resourcesPerRoll in descending order
    sortedArray.sort((a, b) => b.resourcesPerRoll - a.resourcesPerRoll);

    // Update the rank property in the original array
    let currentRank = 1;
    for (let i = 0; i < sortedArray.length; i++) {
        if (sortedArray[i].buildable){
            if (i > 0 && sortedArray[i].resourcesPerRoll !== sortedArray[i - 1].resourcesPerRoll) {
                currentRank++;
            }
            const originalIndex = g_intersections.indexOf(sortedArray[i]);
            g_intersections[originalIndex].rank = currentRank;
        } else {
            g_intersections[originalIndex].rank = 0;
        }
    }
}

function drawIntersectionRanks(){
    if (g_intersections != null){
        let ctx = document.getElementById('catanBoard').getContext('2d');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // calculate range of ranks
        let range = Math.max(...g_intersections.map(obj => obj.rank)) - 1;

        let circleRadius = 0.25;
        g_intersections.forEach(intersection => {
            if(intersection.buildable){
                // draw circle
                ctx.strokeStyle = "black";
                ctx.lineWidth = Math.floor(0.5 * upscale);
                ctx.fillStyle = 'black';
            
                let actual = convert(intersection.coordinates.width, intersection.coordinates.height);
                let actualRadius = convert(intersection.coordinates.width + circleRadius, intersection.coordinates.height).width - actual.width;
                ctx.beginPath();
                ctx.arc(actual.width, actual.height, actualRadius*(1-(2/5)*(intersection.rank - 1) / range), 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();

                // draw number
                ctx.fillStyle = greenToRedScale((intersection.rank - 1) * 100 / range);
                ctx.font = `700 ${dim/(20+24*(intersection.rank - 1) / range)}px Garamond`;
                actual = convert(intersection.coordinates.width, intersection.coordinates.height - 0.03);
                ctx.fillText(intersection.rank.toString(), actual.width, actual.height);
            }
        });
    }
}

function toggleHelpCheckbox(helpNum){
    let helpDictText = helpLookup[helpNum];
    help[helpDictText] = [false, true][help[helpDictText]?0:1];
    let helpCheckbox = document.getElementById("controlBoxCheckbox"+helpDictText);

    //update checkbox
    if(help[helpDictText]){
        helpCheckbox.classList.remove("unchecked");
        helpCheckbox.classList.add("checked");
        helpCheckbox.innerHTML = "<p>✖</p>";
    } else {
        helpCheckbox.classList.remove("checked");
        helpCheckbox.classList.add("unchecked");
        helpCheckbox.innerHTML = "";
    }
    drawBoard();
}

function toggleAllHelp(){
    let oneActive = false
    helpLookup.forEach(helpOption => {
        if(help[helpOption]){
            oneActive = true;
        }
    });
    helpLookup.forEach(helpOption => {
        help[helpOption] = !oneActive;
        let helpCheckbox = document.getElementById("controlBoxCheckbox"+helpOption);
        if(oneActive){
            helpCheckbox.classList.remove("checked");
            helpCheckbox.classList.add("unchecked");
            helpCheckbox.innerHTML = "";
        } else {
            helpCheckbox.classList.remove("unchecked");
            helpCheckbox.classList.add("checked");
            helpCheckbox.innerHTML = "<p>✖</p>";
        }
    });

    drawBoard();
}

// TODO: needs to be updated with every new help addition;
function drawAllActiveHelp(){
    helpLookup.forEach(helpOption => {
        if(help[helpOption]){
            switch (helpOption) {
                case "IntersectionRank":
                    drawIntersectionRanks();
                    break;
            


                default:

                    break;
            }
        }
    });

}


function greenToRedScale(perc) {
    // perc is [0-100]
    perc = 100 - perc;
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}