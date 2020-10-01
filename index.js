    
document.getElementById("filebtn").disabled = true;
var colorBar = d3.select("#colorbar")
function autocomplete(inp, arr) {
	var currentFocus;
	inp.addEventListener("input", function (e) {
		var a, b, i, val = this.value;
		closeAllLists();
		if (!val) {
			return false;
		}
		currentFocus = -1;
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		this.parentNode.appendChild(a);
		for (i = 0; i < arr.length; i++) {
			if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
				b = document.createElement("DIV");
				b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
				b.innerHTML += arr[i].substr(val.length);
				b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
				b.addEventListener("click", function (e) {
					inp.value = this.getElementsByTagName("input")[0].value;
					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});


	function closeAllLists(elmnt) {
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
}

//  Create variables used throughout the project
var completeData;
var allSignaturesJSON;
var allCYCCJSON;
var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Get the urls for the project
var antimony_url = "https://gist.githubusercontent.com/bjnish8/23c32625437b0ddf6f134cf79f2c94bb/raw/8082c4e861d5c0a34aaadbe91602b5005cf93b47/antimony_final.json";
var citra_url = "https://gist.githubusercontent.com/bjnish8/0bedc6b1ca83873162969661d0241dce/raw/90cc71241e67c338eede33bfc076633d1aae353d/citra_final.json";
var mmc5_url = "https://gist.githubusercontent.com/bjnish8/ae68e4ca95a1cda7b5ef604036f98d2f/raw/ca771b50a9dd37704ade868aba60941b99b343ed/multimc5_final.json";
var allSignatures_url = "https://gist.githubusercontent.com/bjnish8/23b0c5ab242f9128167b87a84d819520/raw/67ea2177ede071e7cbed17900c77873319f678db/allSignatures.json";
var cycc_url = "https://gist.githubusercontent.com/bjnish8/42c6edea65006f0ac34f342fa8e5f305/raw/39a0722695d25157259c58f45c2af8615aad0f11/cycc.json"

// Append legend for cluster/files
var legend = d3.select("#legend")
	.append("svg")
	.attr("height", 70)
legendData = {
	'Cluster': "#4f92e3",
	'File': "#0d1040"
}
let count = 1
for (let x in legendData) {
	legend.append("circle").attr("cx", 30).attr("cy", 30 * count).attr("r", 10).style("fill", legendData[x])
	legend.append("text").attr("x", 50).attr("y", 31 * count).text(x).style("font-size", "11px").style('fill', 'white').attr(
		"alignment-baseline", "middle")
	count++
}

// Create a transition object
var t = d3.transition()
	.duration(550);
var force = d3.forceSimulation();

// Stack to hold the indexes visited
var backButtonStack = [];
var width = 1000,
	height = 650

var zoom_ = d3.zoom()
	.scaleExtent([1/2, 10])
	.on("zoom", zoomed)

// Append the visualization element to the "viz" div
var svg = d3.select("#viz")
	.append("svg")
	.call(zoom_)
	.on("zoom", zoomed)
	.append("g")
 	.on("dblclick.zoom", null);

d3.select("#zoom-in").on("click", function() {
	zoom_.scaleBy(svg.transition().duration(350), 1.3);
});
d3.select("#zoom-out").on("click", function() {
	zoom_.scaleBy(svg.transition().duration(350), 0.7);
});

function zoomed() {
	svg.attr("transform", d3.event.transform);
}

var svg2 = d3.select("#colorbar").append("svg")

var n = 300;
var factor = 1;
var colorscale = d3.scaleLinear().domain([1,Math.floor(n/3),Math.floor(2 * n/3), n])
  .range(["black", "green","orange", "red"]);
  
function createIntensityChart(highCYC){

factor = n/highCYC;
var myrects = svg2.append("g").selectAll(".rects");
var myTexts = svg2.append("g").selectAll(".texts");

var data = [];
var textData = [];
var step = 50;
var yoffset = 45;
var xoffset = 6;
for (var i = 0; i <= n; i++) {
   data.push(i);
   if (i % step === 0){
   textData.push(i)
   }
}

myText = myTexts.data(textData)
.enter().append("text")
.html(function(d, i){var txt = Math.floor(i*step/factor).toString(); return (i * step === n) ? "= " + txt : txt })
.attr("x", xoffset)
.attr("y", function(d,i){return yoffset + 10 + i* step})
.style("font-size", "12px")

svg2.append("text").text("Methods CYCC")
.attr("x", 2)
.attr("y", 32)
.style("font-weight", "bold")
.style("font-size", "12px")


var myrect = myrects.data(data).
	enter().append('rect')
      .attr("x", xoffset + 35)
    	.attr("y", function(d,i){return yoffset + i*1})
      .attr("width",25)
      .attr("height", 20)
      .style("fill", function(d){return colorscale(d)})
}
createIntensityChart(100);

// Create a drop down list to select among the projects
var dropdown = d3.select("#dropdowndiv")
	.insert("select", "svg")
	.attr("id", "dropdown")
	.on("change", dropdownChange);
dropdown.selectAll("option")
	.data(["Antimony", "Citra", "MultiMC5"])
	.enter().append("option")
	.attr("value", function (d) {
		return d;
	})
	.text(function (d) {
		return d
	});

// Append ("g") needed so that links do not appeare before nodes
svg.append("g").attr("class", "links");
svg.append("g").attr("class", "nodes");

// Select the node and link objects
var node = svg.select(".nodes").selectAll(".nodes")
var link = svg.select(".links").selectAll(".links")

// Load the respective project on change in dropdown
function dropdownChange() {
  seeFileView(false)
	var ddValue = d3.select("#dropdown").property('value');
	switch (ddValue) {
		case 'Antimony':
			loadData(antimony_url, loadCYCC)
			break;
		case 'Citra':
			loadData(citra_url, loadCYCC)
			break;
		case 'MultiMC5':
			loadData(mmc5_url, loadCYCC)
			break;
		default:
			console.log("Default")
	}
};
// Choose color to differentiate the Clusters and the files
	function getColor(size, type) {
		if (size > 1) {
			return "#405c85"
    }
    else{
      if(type === "f"){
			return "#97d4f0"
      }
      else{
        return "#000000"
      }
    }
	}

function update(index) {
	// threshold variable hold the minimum value for the strength of connection between two nodes.
	var threshold = parseInt(document.getElementById("strengthval").innerHTML)

	// Simulation object used to animate the nodes and links 
	force
		.force("charge", d3.forceManyBody()
			.strength(-200).distanceMin(10).distanceMax(600))
		.force("link", d3.forceLink().id(function (d) {
			return d.index
		}))
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("collide", d3.forceCollide(function (d) {
			return d.r + 10
		}).iterations(2))
		.force("y", d3.forceY(0))
		.force("x", d3.forceX(0))

	// Data for the current view
	var data_ = completeData.v[index]

	// Data for edges and nodes
	var edges_data;
	var nodes_data = data_.n;

	// If no threshold proceed normally
	if (threshold > 0) {
		edges_data = data_.e.filter(function (item) {
			if (item.w > threshold) {
				return item
			}
		});
	}
	// Else select only the links which are above the threshold level
	else {
		edges_data = data_.e;
	}

	// Add all the file names to the autocomplete search box
	var dropdownItems = []
	for (var i of completeData.f) {
		dropdownItems.push(i)
	}
	autocomplete(document.getElementById("myInput"), dropdownItems);

	// Find the largest node to normalize the views.
	var largestNode = 1;
	for (var i of nodes_data) {
		if (largestNode < i.h) {
			largestNode = i.h
		}
	}

	// Get the links based on the source and target variables
	link = link.data(edges_data, function (d) {
		return d["source"].id + "-" + d["target"].id;
	})

	// Remove the old and unneeded links
	link.exit().remove();

	// Add the new links as required
	link = link.enter()
		.append("line")
		.attr("class", "link")
		.style("stroke-width", function (d) {
			return d.w < threshold ? 0 : Math.pow(d.w, 1 / 6);
		})
		.merge(link)
		.on("mouseover", function (d) {
			d3.select(this).style("stroke", "orange");
			// Show the tooltip on hover
			div.transition()
				.duration(200)
				.style("opacity", .9);
			
			if (d.source.t === "f") {
				var source_ = d.source.s > 1 ? "Cluster":completeData.f[d.source.index]
				var target_ = d.target.s > 1 ? "Cluster":completeData.f[d.target.index]

				div.text(source_ + " <---> " + target_ + " | " + "Connections: " + d.w)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 38) + "px");
			}
			if (d.source.t === "m"){
				var source_ = d.source.s > 1 ? "Cluster":completeData.m[d.source.index].m[0]
				var target_ = d.target.s > 1 ? "Cluster":completeData.m[d.target.index].m[0]
				div.text(source_ + " <---> " + target_ + " | " + "Connections: " + d.w)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 38) + "px");
			}
		})
		.on("mouseout", function () {
			// Restore original settings on mouse out
			d3.select(this).style("stroke", "#82431f")//#82431f
			div.transition()
				.duration(500)
				.style("opacity", 0);
		});

	node = node.data(nodes_data, function (d) {
		return d.l
	})
	node.exit()
		.remove();

	// Disable back button if the stack is null which means we cannot go back
	if (backButtonStack.length !== 0) {
		d3.select("#backbutton")
			.attr("disabled", null)
			.style("opacity", "1")
			.style("background-color", "dodgerblue")
			.style("color", "white")
	} else {
		d3.select("#backbutton")
			.style("opacity", "0")
			.attr("disabled", "true")
	}

	// Work on the nodes
	node = node.enter().append('circle')
		.attr('fill', function (d) {
			if (d.t === "f" || d.s > 1)
			return getColor(d.s, d.t);
				else{
					if (completeData.m[d.l]){
						var cycc = allCYCCJSON[document.getElementById("dropdown").value.toLowerCase()][completeData.m[d.l].m[0]];
					if (typeof(cycc) !== "undefined" || cycc > 5){
							return colorscale(cycc * 3);
					} else {
						return ("rgb(0, 0, 0)")
					}
					}
				}
		})
		.attr("id", function (d) {
			return "node_" + d.l.toString()
		})
		.merge(node)
		.on("click", function (d) {
			click(d)//, d.h, d.l)
		})
		.attr("class", "node")
		.attr('r', function (d) {
			return largestNode === 1 ? 8 : Math.pow(d.s / largestNode, 1 / 3) * 28
		})
		.on("mouseover", function (d) {
			// Display the name of the node on hover via the tooltip
	    var name = "Cluster (" + d.s.toString() + ")"
			if (d.l !== "") {
        if (d.t === "f"){
          name = completeData.f[d.l]
        } else{
          var aliases = "<br> <br> Aliases: ";
		for (var i of completeData.m[d.l].m){
			aliases += "<br> <li>"
			aliases += i
			aliases += "</li> <br>"
		}
			aliases += "CYCC: "
			var cycc = allCYCCJSON[document.getElementById("dropdown").value.toLowerCase()][i]
			if (typeof(cycc) === "undefined")
				cycc = "0";
			aliases += cycc
			d3.select("#info")
				.html("Method in file: " + completeData.f[completeData.m[d.l].f] + aliases)
				.style("color", "black")
				.style("opacity", 0.95)
			}
      }
      if (d.s > 1 || d.t === "f"){
     		div.transition()
				.duration(200)
				.style("opacity", .95);
			div.text(name)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 38) + "px");
	  }
   
		})
		.on("mouseout", function (d) {
			// reduce the opacity on mouseout
		if (d.s > 1 || d.t === "f")
			div.style("opacity", 0);
		if (d.t === "m")
			d3.select("#info")
				.style("opacity", 0)
		});


	force.nodes(nodes_data)
		.force("link").links(edges_data)
	const simulationDurationInMs = 5000;

	// Calculate time so that we stop the simulation after 5 seconds
	let startTime = Date.now();
	let endTime = startTime + simulationDurationInMs;
	force.on("tick", onSimulationTick);
	force.alpha(1).restart();

	function onSimulationTick() {
		if (Date.now() < endTime) {
			link.attr("x1", function (d) {
					return d["source"].x;
				})
				.attr("y1", function (d) {
					return d["source"].y;
				})
				.attr("x2", function (d) {
					return d["target"].x;
				})
				.attr("y2", function (d) {
					return d["target"].y;
				});

			node.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

		} else {
			force.stop();
		}
	}
}

// Call function whenever the slider is changed 
d3.select("#slider")
	.on("input", inputted);

function inputted() {
	d3.select("#strengthval")
		.text(this.value);
	// Get the current page index and display the graph     
	if (typeof (backButtonStack[backButtonStack.length - 1]) === "undefined") {
		update(0)
	} else
		update(backButtonStack[backButtonStack.length - 1])
}

// Go to the topmost level (0) on button click
function gotoTop() {
	backButtonStack = [];
  if (document.getElementById("filebtn").disabled)
	  update(0);
  else
    update(1);
}

// See the view for files
function seeFileView(shouldUpdate){
	d3.select("#colorbar").style("visibility", "hidden")
  backButtonStack= []
  	d3.select("#searchButton")
			.attr("disabled", null)
    d3.select("#methodbtn")
			.attr("disabled", null)
		d3.select("#filebtn")
			.attr("disabled", "true")
    // document.getElementById("output").innerText = "Files"
    showInfo("Displaying files view", "black", 2000)
	
    if (shouldUpdate)
      update(0)
	}

// See the view for methods
function seeMethodView(shouldUpdate){
	d3.select("#colorbar").style("visibility", "visible")
  backButtonStack = []
  	d3.select("#searchButton")
			.attr("disabled", "true")
    	d3.select("#methodbtn")
			.attr("disabled", "true")
		d3.select("#filebtn")
			.attr("disabled", null)
    showInfo("Displaying Methods view", "black", 2000)
    if (shouldUpdate)
      update(1)

    // document.getElementById("output").innerText = "Methods"

}

// Display the file information on click
function click(d) {
	if (d3.event.defaultPrevented) return; // ignore drag
	if (d.h !== -1) {
		backButtonStack.push(d.h)
		update(d.h);
	} else {
  if (d.t==="f")
  {
		var methods = allSignaturesJSON[document.getElementById("dropdown").value.toLowerCase()][d.l.toString()]
		if (typeof (methods) === "undefined")
			showInfo("File has no changed methods", "red", 2000)
		else {
			showMethodsInfo(methods);
		}
	}
  else{
    
  }
  }
}

// Go back a level on click
function goBack() {
	backButtonStack.pop()
	var lastIndex = backButtonStack[backButtonStack.length - 1]
	if (lastIndex === -1 || typeof (lastIndex) === "undefined")
	{
	if(document.getElementById("filebtn").disabled)
		lastIndex = 0
	else
		lastIndex = 1
	}
	update(lastIndex)
}

// Search for the file at the current level
function searchItem() {
	var fileID = completeData.f.findIndex(function (thisID) {
		return thisID === document.getElementById("myInput").value
	});
	var item = d3.select("#node_" + fileID)
	if (item._groups[0][0]) {
		item.attr("fill", "green")
			.transition(t)
			.delay(1000)
			.attr('fill', function (d) {
				return getColor(d.s, d.t);
			})
	} else {
		showInfo("Item not present in the current level", "red", 2000)

	}
}

// Show the error info generally
function showInfo(infoText, color, delay) {
	try{
	d3.select("#info")
		.html(infoText)
		.style("color", color)
		.style("opacity", 0.95)
		.transition(t)
		.delay(delay)
		.style("opacity", 0)
	}
	catch {
		d3.select("#info")
		.style("opacity", 0.95)
	}
}

function loadData(url, callback) {
	d3.json(url, function (error, data) {
		completeData = data;
		callback(loadAllMethods)
	})
}

// Load cycc data
function loadCYCC(callback) {
	d3.json(cycc_url, function (error, data) {
		allCYCCJSON = data;
		callback(update)
	})
}

// Load all methods data
function loadAllMethods(callback) {
	d3.json(allSignatures_url, function (error, data) {
		allSignaturesJSON = data;
		callback(0)
	})
}

// Call the function to start it all
loadData(antimony_url, loadCYCC)

// Show the table with the Methods and CYCC
function showMethodsInfo(methods) {
	var methodsList = [];
	for (var i of methods) {
		methodsList.push([i, allCYCCJSON[document.getElementById("dropdown").value.toLowerCase()][i]])
	}
	var table = d3.select("#tables").insert("table");
	var header = table.append("thead").append("tr");
	header
		.selectAll("th")
		.data(["Method Name", "CYCC"])
		.enter()
		.append("th")
		.text(function (d) {
			return d;
		});
	var tablebody = table.append("tbody");
	rows = tablebody
		.selectAll("tr")
		.data(methodsList)
	rows.exit().remove()
	rows = rows.enter()
		.append("tr");
	cells = rows.selectAll("td")
		.data(function (d) {
			return d;
		})
	cells.exit().remove()
	cells = cells.enter()
		.append("td")
		.text(function (d) {
			return d;
		});

	svg.style("visibility", "hidden")
		.transition(t)
		.delay(5500)
		.style("visibility", "visible")
	table.transition(t)
		.delay(5000)
		.remove();
}