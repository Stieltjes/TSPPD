// Changed type from string to number because I want to label them sequentially
type TripId = number

// Changed Location to Emplacement because Location seems to be a reserved word with the version of Typescript compiler that I am using
interface Emplacement {
latitude: number;
longitude: number;
}
enum WaypointType {
Pickup = 1 ,
Dropoff = 2
}
interface Waypoint {
type : WaypointType
location: Emplacement
}
interface Trip {
id: TripId
pickupWaypoint: Waypoint
dropoffWaypoint: Waypoint
}
interface WaypointOutput {
tripId: TripId
type : WaypointType
}
/**
*
* @param location1 Input location
* @param location2 Input location
* @returns Very simple crow distance between 2 points
*/
const distance = (location1: Emplacement, location2: Emplacement): number => {
const dlat = (location2.latitude - location1.latitude)
const dlon = (location2.longitude - location1.longitude)
return Math .sqrt(dlat * dlat + dlon * dlon)
}

//tripSize is the total number of pickup and dropoff pairs, therefore I have 2*tripSize locations on the map
const tripSize = 10;
//track the parent, i.e. where the parent node is
var prt:number[] = new Array(2*tripSize);
// tracks if if the location is in the minimum spanning tree
var mstSet:boolean[] = new Array(2*tripSize);
// This array keeps the minimum distance to the minimum spanning tree
var mindist:number[] = new Array(2*tripSize);
// This array keeps track of which node the minimum distance is with respect to
var minindex:number[] = new Array(2*tripSize);
// This is the sequence of locations visited
var sequence:number[] = new Array(2*tripSize);
// Sequence converted to the form of WaypointOutput instead of in terms of indices
var wpsequence:WaypointOutput[] = new Array(2*tripSize);
// Used to grab the next closest point (greedy)
var mindex:number = 0;
// This is used to index sequence
var count:number = 0;
var totaldistance:number = 0;



// Below are the hard coded locations grabbed from https://github.com/grubhub/tsppdlib/blob/master/instances/grubhub/grubhub-10-0.tsp
let startloc:Emplacement = {
	latitude:42,
	longitude:1000
}
let location1:Emplacement = {
	latitude:521,
	longitude:301
}
let wayp1:Waypoint = {
	type:1,
	location:location1
}
let wayp2:Waypoint = {
	type:2,
	location:{latitude:276,longitude:648}
}

let trip1:Trip = {
	id:1,
	pickupWaypoint:wayp1,
	dropoffWaypoint:wayp2
}

let trip2:Trip = {
	id:2,
	pickupWaypoint:{type:1,location:{latitude:337,longitude:446}},
	dropoffWaypoint:{type:2,location:{latitude:357,longitude:608}}
}

let trip3:Trip = {
	id:3,
	pickupWaypoint:{type:1,location:{latitude:367,longitude:897}},
	dropoffWaypoint:{type:2,location:{latitude:490,longitude:885}}
}

let trip4:Trip = {
	id:4,
	pickupWaypoint:{type:1,location:{latitude:570,longitude:363}},
	dropoffWaypoint:{type:2,location:{latitude:383,longitude:258}}
}

let trip5:Trip = {
	id:5,
	pickupWaypoint:{type:1,location:{latitude:248,longitude:424}},
	dropoffWaypoint:{type:2,location:{latitude:279,longitude:563}}
}

let trip6:Trip = {
	id:6,
	pickupWaypoint:{type:1,location:{latitude:730,longitude:430}},
	dropoffWaypoint:{type:2,location:{latitude:651,longitude:34}}
}

let trip7:Trip = {
	id:7,
	pickupWaypoint:{type:1,location:{latitude:220,longitude:346}},
	dropoffWaypoint:{type:2,location:{latitude:528,longitude:510}}
}

let trip8:Trip = {
	id:8,
	pickupWaypoint:{type:1,location:{latitude:829,longitude:794}},
	dropoffWaypoint:{type:2,location:{latitude:887,longitude:556}}
}

let trip9:Trip = {
	id:9,
	pickupWaypoint:{type:1,location:{latitude:845,longitude:328}},
	dropoffWaypoint:{type:2,location:{latitude:1000,longitude:304}}
}

let trip10:Trip = {
	id:10,
	pickupWaypoint:{type:1,location:{latitude:281,longitude:621}},
	dropoffWaypoint:{type:2,location:{latitude:231,longitude:467}}
}

// Here I'm lumping all trips in an array
var fulltrips:Trip[];
fulltrips = [trip1,trip2, trip3, trip4, trip5, trip6, trip7, trip8, trip9, trip10]


//This returns the location of the index in the array
const getloc = (tindex:number):Emplacement => {
	if (tindex<tripSize) {
		return fulltrips[tindex].pickupWaypoint.location;
	} else {
		return fulltrips[tindex%tripSize].dropoffWaypoint.location;
	}

}

// Used to grab the minimum distance to the minimum spanning tree
const minkey = () : number => {
	var min:number = 2000;
	var index:number = -1;
	
	for(var i=0;i<2*tripSize;i++) {
		if ((mindist[i]<min)&&(mstSet[i]==false)) {
			index = i;
			min = mindist[i];
		}
	}
	
	return index;
}

// This initialises my arrays. I'm indexing all trips' pickup and dropoff together, therefore the size is 2*tripSize
// The initial MST is empty. The parent nodes are dummied to -1, the starting location.
// The minimum indices are dummied to starting location as well. The starting minimum distances are directly calculated wrt starting location for pickup points. The dropoff points are given 2000 to indicate infinity.
for (var num=0;num<tripSize;num++) {
	prt[num]=-1;
	prt[num+tripSize]=-1;
	mstSet[num] = false;
	mstSet[num+tripSize] = false;
	minindex[num] = -1;
	minindex[num+tripSize] = -1;
	mindist[num] = distance(startloc,fulltrips[num].pickupWaypoint.location);
	mindist[num+tripSize] = 2000;
}

// The function to update minimum distances. Whenever a node is added, all the pickup nodes have to updated because attaching to any parent node is valid.
// When a dropoff node is added, we go through all of its parents. If the parent is a pickup location, we update its corresponding dropoff location.
for (var num=0;num<2*tripSize;num++) {
	mindex = minkey();
	prt[mindex] = minindex[mindex];
	mstSet[mindex] = true;
	for (var numy=0;numy<tripSize;numy++) {
		if ((mstSet[numy]==false) && (distance(getloc(mindex),getloc(numy))<mindist[numy])) {
			mindist[numy] = distance(getloc(mindex),getloc(numy));
			minindex[numy] = mindex;
		}
	}
	
	if (mindex<tripSize) {
			mindist[mindex+tripSize] = distance(getloc(mindex),getloc(mindex+tripSize));
			minindex[mindex+tripSize] = mindex;
	} else {
		var tmpprt = prt[mindex];
		while (tmpprt!=-1) {
			if ((tmpprt<tripSize) && (distance(getloc(mindex),getloc(tmpprt+tripSize))<mindist[tmpprt+tripSize])){
				mindist[tmpprt+tripSize] = distance(getloc(mindex),getloc(tmpprt+tripSize));
				minindex[tmpprt+tripSize] = mindex;
			}
			tmpprt = prt[tmpprt];
		}	
	}
}


/*For testing purposes
for (var num=0;num<2*tripSize;num++) {
	console.log(prt[num]);
	console.log(getloc(num));
}

for (var num=0;num<2*tripSize;num++) {
	console.log(prt[num]+"\n");
	console.log(mstSet[num]+"\n");
	console.log(mindist[num]+"\n");

}
*/

// This traverses the prt tree in preorder fashion
const findsequence = (parentnode:number) => {
	for (var num=0; num<2*tripSize; num++) {
		if (prt[num] == parentnode) {
			sequence[count] = num;
			count++;
			findsequence(num);
		}
	}
}

// The bulk of the work is already done in findsequence, this merely lists the WaypointOutput so it's human readable. Also the cumulative distances are displayed
const execute = () => {
	var triptype:WaypointType;
	findsequence(-1);
	for (var i=0;i<2*tripSize;i++) {
		if (sequence[i] < tripSize) {
			triptype = 1;
		} else {triptype = 2}
		let temp : WaypointOutput = {tripId:sequence[i]%tripSize+1,type:triptype}
		wpsequence[i] = temp;
	}
	console.log("The cumulative total distance travelled is:")
	totaldistance = totaldistance + distance(startloc,getloc(sequence[0]));
	for (var j=1;j<2*tripSize;j++){
		console.log(totaldistance);
		totaldistance = totaldistance + distance(getloc(sequence[j-1]),getloc(sequence[j]));
	}

		
}

// The main body
execute();
console.log(wpsequence);
console.log("Total distance travelled is " + totaldistance);