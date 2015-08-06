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

function getLon()
{
    var r = new Object();
    r.User = "lor.lucignano@gmail.com";
    r.Pass = "675dd12f8800bc68f38726a4c541ecdeb87beed1";
    r.Environment = "fast_search_1_0";
    r.Origin = "LON";
    r.DepartureFrom = "2016-01-13";
    r.LengthOfStay = [4,5,6];
    var date = new Date()
    r.DepartureFrom = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDay();
    r.DepartureTo = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDay()+4);
    console.log(r.DepartureFrom)
    console.log(r.DepartureTo)
    r.PriceMax = 1000;
    var url = 'https://fs-json.demo.vayant.com:7081';
    var rbody = JSON.stringify(r);
    var invocation = new XMLHttpRequest();
    invocation.open('POST', url, true);
    invocation.setRequestHeader('Content-Type', 'application/json');
    invocation.onreadystatechange = function(data){
	if(invocation.readyState == 4 && invocation.status == 200)
	{
	    $( "#result" ).text(invocation.responseText)
	    console.log(invocation.responseText);
	}
    };
    invocation.send(rbody);
}

app.post('/request/', function(req, res) {
    // TODO: 
    // 1) Read origins from req
    // 2) Run requests from origins
    // 3) Save each result in appropriate place in dictionary of airports
    // 4) Go through all airports and get the cheapest connections
    // 5) Return connections
});

// [START server]
/* Start the server */
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
