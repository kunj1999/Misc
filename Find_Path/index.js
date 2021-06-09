//Size of individual cell
var w = 10;
//Number of columns and row in the canvas
var col, row;

// Hold all the cells
var grid;

// Algorithms offered by path finder
const Algorithm = {
    NONE: 1,
    BFS: 2,
    DIJKSTRA: 3,
    AS: 4
};

// Which algorithm to use to solve the maze
var algo = Algorithm.NONE;

// Queue to keep track of which node needs to be explored
var queue = [];

// Keeps track of if we have found path to the end
var found = false;

// Hold pointer to start and end node
var start, end;

// This is helper variable used to display message to user path cannot be found
// This prevent message from being repeated over and over again
var message = false;

// cell container
class cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = "white";
        this.visited = false;
        this.wall = false;
        
        // Randomly assign whether the cell is wall or not.
        if(Math.floor((Math.random() * (1.25 - 0.00)))) {
            this.wall=true;
            this.color = "black";
        }
        this.dist = Number.MAX_VALUE;
        this.prev = null;
        this.neighbors = [];
        this.heuristic = 0;
        this.calculatedHeuristic = 0;
    }
    // This will reset the maze such that other algorithm can be tried out
    default() {
        if(!this.wall) {
            this.color = "white";
            this.visited = false;
            this.dist = Number.MAX_VALUE;
            this.prev = null;
            this.calculatedHeuristic = 0;
        }
    }
    // Future function to allow user to manually add a wall
    add_wall() {
        this.color = "black";
        this.wall = true;
    }
    // Starting position
    start(){
        this.color = "green";
        this.dist = 0;
    }
    // Node/cell is visited
    visit(){
        this.color = "#c1c851";
        this.visited = true;
    }
    // Ending position
    end(){
        this.wall = false;
        this.color = "red";
    }
    // Once we found a shortest path from start to end it will be highlighted in green
    path(){
        this.color = "green";
    }
    // Change the color of current cell. Used only for visualization
    current_element() {
        this.color = "blue";
    }
    // Add the neighbors of current cell
    Add_neighbors(){
        if(this.wall) {return;}
        // If statements to account for edge cases
        if (this.y > 0) {
            this.neighbors.push(grid[this.x][this.y - 1]);
        }
        if(this.y < row-1) {
            this.neighbors.push(grid[this.x][this.y + 1]);
        }
        if(this.x > 0) {
            this.neighbors.push(grid[this.x - 1][this.y]);
        }
        if (this.x < col-1) {
            this.neighbors.push(grid[this.x + 1][this.y]);
        }
        // We randomly shuffle neighbors to avoid bias on x or y
        this.neighbors.sort(() => Math.random() - 0.5);
    }
    // Function to draw the function. Refer to p5.js documentation
    print_square() {
        fill(this.color);
        noStroke();
        square(this.y*w, this.x*w, w);
        
    }
}

// Dijkstra's Algorithms
function dijkstra() {
    // This is to indicate which node is being evaluated right now. we omit the start node for simplicity.
    // This will only add visual effect, no impact on the algorithm
    if(curr != start){
        curr.visit();
    }

    //Get the next node to be evaluated from the queue
    curr = queue.shift();

    // This is to indicate which node is being evaluated right now. we omit the start node for simplicity.
    // This will only add visual effect, no impact on the algorithm
    if(curr != start){
        curr.current_element();
    }

    // Get all the neighboring nodes
    currNeighbors = curr.neighbors;

    // Iterate through each neighbor
    for (var i = 0; i < currNeighbors.length; i++) {
        //If the neighbor is already visited, then it is already in the queue.
        //So, if we find shorter path to it, we only update the distance and previous node
        if(currNeighbors[i].visited) {
            if((curr.dist + 1) < currNeighbors[i].dist) {
                currNeighbors[i].prev = curr;
                currNeighbors[i].dist = curr.dist + 1;
            }
        }
        //If the neighbor is not visited and not a wall, then update distance, previous node and visited status.
        //Finally, add it to the queue.
        else if(!currNeighbors[i].wall){
            currNeighbors[i].dist = curr.dist + 1;
            currNeighbors[i].visit();
            currNeighbors[i].prev = curr;
            queue.push(currNeighbors[i]);
        }

    }

    // Sort the queue such that nodes are ordered in increasing order of their distance to starting node
    if (queue.length > 1) {
        queue.sort((a , b) => {
            if(a.dist > b.dist) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    // If we found the end node, empty queue => No more looking for path
    if (curr == end){
        queue = [];
        found = true; // Once this variable is set to true, it will print the shortest path from start to end.
    }
}

// Breath First Search algorithm
function bfs() {
    // This is to indicate which node is being evaluated right now. we omit the start node for simplicity.
    // This will only add visual effect, no impact on the algorithm
    if(curr != start){
        curr.visit();
    }

    //Get the next node to be evaluated from the queue
    curr = queue.shift();

    // This is to indicate which node is being evaluated right now. we omit the start node for simplicity.
    // This will only add visual effect, no impact on the algorithm
    if(curr != start){
        curr.current_element();
    }
    
    //Get all the neighboring nodes
    currNeighbors = curr.neighbors;

    // Iterate through each neighbor
    for (var i = 0; i < currNeighbors.length; i++) {
        // If the neighbor is not visited and it is not a wall, we add it to the end of the queue
        if((!currNeighbors[i].wall) && (!currNeighbors[i].visited)){
            currNeighbors[i].visit();
            currNeighbors[i].prev = curr;
            queue.push(currNeighbors[i]);
        }
    }

    // If we found the end node, empty queue => No more looking for path
    if (curr == end){
        queue = [];

        // Once this variable is set to true, it will print the shortest path from start to end.
        found = true;
    }
}

// Function will add the heuristic values to each node.
function as_init() {
    for (var i = 0; i < row; i++) {
        for(var j = 0; j < col; j++){
            curr = grid[i][j]
            // We guess that distance may be x displacement + y displacement
            curr.heuristic = Math.abs(end.x - curr.x) + Math.abs(end.y - curr.y);
        }
    }
}


function as_start() {
    // This is to indicate which node is being evaluated right now. we omit the start node for simplicity.
    // This will only add visual effect, no impact on the algorithm
    if(curr != start){
        curr.visit();
    }

    //Get the next node to be evaluated from the queue
    curr = queue.shift();

    // This is to indicate which node is being evaluated right now. we omit the start node for simplicity.
    // This will only add visual effect, no impact on the algorithm
    if(curr != start){
        curr.current_element();
    }
    
    //Get all the neighboring nodes
    currNeighbors = curr.neighbors;

    // Iterate through each neighbor
    for (var i = 0; i < currNeighbors.length; i++) {
        //If the neighbor is already visited, then it is already in the queue.
        //So, if we find shorter path to it, we only update the distance, previous node and heuristic.
        if(currNeighbors[i].visited) {
            if((curr.dist + 1) < currNeighbors[i].dist) {
                currNeighbors[i].prev = curr;
                currNeighbors[i].dist = curr.dist + 1;
                currNeighbors[i].calculatedHeuristic = currNeighbors[i].heuristic + currNeighbors[i].dist;
            }
        }
        else if(!currNeighbors[i].wall && !currNeighbors[i].visited){
            //If the neighbor is not visited and not a wall, then update distance, previous node, visited status and heuristic.
            //Finally, add it to the queue.
            currNeighbors[i].dist = curr.dist + 1;
            currNeighbors[i].visit();
            currNeighbors[i].prev = curr;
            currNeighbors[i].calculatedHeuristic = currNeighbors[i].heuristic + currNeighbors[i].dist;
            queue.push(currNeighbors[i]);
        }
    }

    // We sort the queue in increasing order of their heuristic distance
    if (queue.length > 1) {
        queue.sort((a, b) => {
            if(a.calculatedHeuristic > b.calculatedHeuristic) {
                return 1;
            } else {
                return -1;
            }
        });
    }

    // If the end node is found, we stop looking for it and print out the path
    if (curr == end){
        queue = [];
        found = true;
    }
}

function setup() {
    // We draw a canvas and based on that, we derive how many columns and rows needed.
    createCanvas(400, 400);
    col = floor(width/w);
    row = floor(height/w);

    // We compose 2d array to hold all of our nodes
    grid = new Array(row);
    for (var i = 0; i < row; i++) {
        grid[i] = new Array(col);
    }

    // For each node we create new cell type
    for (var i = 0; i < row; i++) {
        for(var j = 0; j < col; j++){
            grid[i][j] = new cell(i, j);
        }
    }

    // Here we decide what our starting and end position will be
    start = grid[0][0];
    end = grid[row-6][col-1];
    start.start();
    end.end();

    init();
    as_init();
    // we add neighboring nodes
    for (var i = 0; i < row; i++) {
        for(var j = 0; j < col; j++){
            grid[i][j].Add_neighbors();
        }
    }
}
  
function draw() {
    // Draw the maze
    background(220);
    for (var i = 0; i < row; i++) {
        for(var j = 0; j < col; j++){
            grid[i][j].print_square();
        }
    }

    // If the queue is not empty that we need to keep looking for the path
    if(queue.length) {
        // Simple switch statement to call the corresponding algorithm
        switch(algo) {
            case Algorithm.BFS:
                bfs();
                break;
            case Algorithm.DIJKSTRA:
                dijkstra();
                break;
            case Algorithm.AS:
                as_start();
                break;
            default:
                break;
        }
    } else {
        // If we found the path to the end, we print out the path.
        if(found) {
            destination = end;

            $("#status p").removeClass("text-secondary").addClass("text-success").text("Path Found!");
            if(algo == Algorithm.DIJKSTRA || algo == Algorithm.AS) {
                $("#length p").text(destination.dist.toString());
            } else if(algo == Algorithm.BFS) {
                $("#length p").text("N/A");
            }

            while(destination) {
                destination.path();
                destination = destination.prev;
            }
        }
        else if (!message && (algo != Algorithm.NONE)) {
            // If we didn't find a path and all the nodes are visited, we display message indicating no path found.
            // Since the function runs in loop, helper variable "message" is used to prevent repeat message display.
            $("#status p").removeClass("text-secondary").addClass("text-danger").text("No solution!");
            console.log("No solution!");
            message = true;
        }
        algo = Algorithm.NONE;
    }
}

// This will reset the canvas
function reset(){
    // Reset the status message to standby
    $("#status p").removeClass("text-success").removeClass("text-danger").addClass("text-secondary").text("Standby");

    // Set each cell to default mode
    for (var i = 0; i < row; i++) {
        for(var j = 0; j < col; j++){
            grid[i][j].default();
        }
    }

    // initialize necessary variables to start the next algorithm if needed.
    start.start();
    end.end();
    queue = [];
    algo = Algorithm.NONE;
    queue.push(start);
    start.visited = true;
    curr = start;
    message = false;
    found = false;
}

// Tells the draw function which algorithm to run on the maze
function algorithm_selection(option){
    if(is_maze_free()) {
        reset();
        algo = option;
        $("#status p").text("In progress")
    }
}

// Return 1 if the algo is not selected, 0 otherwise
function is_maze_free() {
    return algo == Algorithm.NONE ? 1 : 0;
}

// Initialize all buttons callback
function init() {
    
    $("#Reset").click( function(){
        if(is_maze_free()){
            reset();
        }
    });

    $("#Bfs").click(function(){
        algorithm_selection(Algorithm.BFS);
    });

    $("#Dijkstra").click(function(){
        algorithm_selection(Algorithm.DIJKSTRA);
    });

    $("#As").click(function(){
        algorithm_selection(Algorithm.AS);
    });

}