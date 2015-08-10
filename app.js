/*
	Copyright 2015, Google, Inc. 
 Licensed under the Apache License, Version 2.0 (the "License"); 
 you may not use this file except in compliance with the License. 
 You may obtain a copy of the License at 
  
    http://www.apache.org/licenses/LICENSE-2.0 
  
 Unless required by applicable law or agreed to in writing, software 
 distributed under the License is distributed on an "AS IS" BASIS, 
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 See the License for the specific language governing permissions and 
 limitations under the License.
*/
"use strict";

var express = require('express');
var https = require('https');

var app = express();

/* Include the app engine handlers to respond to start, stop, and health checks. */
app.use(require('./lib/appengine-handlers'));
app.use('/static', express.static('static'));

// [START hello_world]
/* Say hello! */
app.get('/', function(req, res) {
  res.sendfile('index.html');
});
// [END hello_world]

app.get('/results/', function(req, res) {    
  res.sendfile('results.html');
});

function getFlights(origin)
{
    var r = new Object();
    r.User = "lor.lucignano@gmail.com";
    r.Pass = "675dd12f8800bc68f38726a4c541ecdeb87beed1";
    r.Environment = "fast_search_1_0";
    r.Origin = origin;
    r.DepartureFrom = "2016-01-13";
    r.LengthOfStay = [4,5,6];
    var date = new Date()
    r.DepartureFrom = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDay();
    r.DepartureTo = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDay()+4);
    r.PriceMax = 10000;

    var url = 'fs-json.demo.vayant.com';
    var port = '7081';
    var rbody = JSON.stringify(r);
    var res = "";

    var options = {
	hostname: url,
	port: port,
	path: '/',
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json'
	}
    };

    var rq = https.request(options, function (response) {
	//another chunk of data has been recieved, so append it to `str`
	response.on('data', function (chunk) {
	    res += chunk;
	});

	//the whole response has been recieved, so we just print it out here
	response.on('end', function () {
	    console.log(res);
	});
    });
    rq.write(rbody);
    console.log(rbody);
    rq.end();

    return res;
}


function processFlights(flighs){
    return [{dest: "LON", price: 100, time: 30}];
}

app.get('/request/', function(req, res) {
    // TODO: 
    // 1) Read origins from req
    // 2) Run requests from origins
    var flightsFromOrigins = [];
    console.log(req);
    flightsFromOrigins.push(processFlights(getFlights(req.query.city1)));
    flightsFromOrigins.push(processFlights(getFlights(req.query.city2)));
    flightsFromOrigins.push(processFlights(getFlights(req.query.city3)));

    // 3) Save each result in appropriate place in dictionary of airports
    var airports = {};
    var i,j;
    var numPpl = flightsFromOrigins.length;
    for (i = 0; i < numPpl; i++){
	for (j = 0; j < flightsFromOrigins[i].length; j++){
	    var apt = flightsFromOrigins[i][j];

	    // if first user, create the airport info
	    if (i == 0){
		airports[apt.dest] = [];
		var j;
		for (j = 0; j<numPpl; j++)
		    airports[apt.dest].push(0);
	    } // if second user and no airport for the first one then skip
	    else if (!(apt.dest in airports)){
		continue;
	    }

	    // TODO remember the best one not the last one
	    airports[apt.dest][i] = {price: apt.price, time: apt.time};
	}
    }

    // 4) Go through all airports and get the cheapest connections
    var keys = Object.keys(airports);

    function computePrice(lst){
	if (lst.length < numPpl)
	    return 999999;
	var val = 0;
	var i;

	for (i = 0; i < numPpl; i++){
	    val += lst[i].price;
	}
	return val;
    }
    var prices = keys.map(function(v) { return {dest: v, price: computePrice(airports[v]), time: 10} });
    prices.sort(function(a, b) {
	return a.price - b.price;
    });

    // 5) Return connections
    res.json(prices.slice(0,10));
});

// [START server]
/* Start the server */
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
