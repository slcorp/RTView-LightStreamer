// *********************************************************
// RTView - LightStreamer Sample Program

// This program establishes a link to a LightStreamer demo server,
// subscribes to several topics, and pushes the received data
// to an RTView DataServer for caching and persistent storage

var ls = require('lightstreamer-client');

var rtview_utils = require('./rtview_utils.js');
rtview_utils.set_targeturl('http://localhost:3275');// this is the default
//rtview_utils.set_targeturl('http://localhost:3270/rtvpost');  // to use servlet instead of port

// Name of the RTView caches created in this demo
var cacheName1 = 'LightStreamerStockDemo';


//var myClient = new ls.LightstreamerClient("http://localhost:8080","DEMO");  
var myClient = new ls.LightstreamerClient("https://push.lightstreamer.com","DEMO");  

myClient.addListener({
  onStatusChange: function(newStatus) {         
    console.log(newStatus);
  }
});

myClient.connect();

var mySubscription = new ls.Subscription("MERGE",["item1","item2","item3"],["stock_name","last_price"]);
mySubscription.setDataAdapter("QUOTE_ADAPTER");
mySubscription.setRequestedSnapshot("yes");

mySubscription.addListener({
  onSubscription: function() {
    console.log("SUBSCRIBED");
  },
  onUnsubscription: function() {
    console.log("UNSUBSCRIBED");
  },
  onItemUpdate: function(obj) {
    console.log(obj.getValue("stock_name") + ": " + obj.getValue("last_price"));
    // copy object values for this topic to rtview data object
    var data = {};
    data.stock_name=obj.getValue("stock_name");
    data.last_price=obj.getValue("last_price");
    console.log('... sending: ' + JSON.stringify(data));
    rtview_utils.send_datatable(cacheName1, data);
  }
});

rtview_utils.create_datacache(cacheName1,
{// cache properties
"indexColumnNames": "stock_name",
"historyColumnNames": "last_price"
},[ // column metadata
{ "stock_name": "string" },
{ "last_price": "double" }
]);

myClient.subscribe(mySubscription);



