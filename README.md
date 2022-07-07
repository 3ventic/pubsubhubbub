# PubSubHubbub subscriber

PubSubHubbub subscriber module. Supports both 0.3 and 0.4 hubs. This is a fork of [pubsubhubbbub](https://github.com/andris9/pubsubhubbub) with deprecated requests dependency replaced with got, callbacks replaced with promises, and turned into an ESM module.

**NB** Do not upgrade from v0.1.x - the API is totally different

## Install

Install with npm

    npm install pubsubhubbub

## Usage

Create a **pubsubhubbub** server object

```javascript
var pubSubHubbub = require('pubsubhubbub');
var pubSubSubscriber = pubSubHubbub.createServer(options);
```

Where options includes the following properties

-   **callbackUrl** Callback URL for the hub
-   **headers** (optional) Custom headers to use for all HTTP requests
-   **secret** (optional) Secret value for HMAC signatures
-   **leaseSeconds** (optional) Number of seconds for which the subscriber would like to have the subscription active
-   **maxContentSize** (optional) Maximum allowed size of the POST messages
-   **username** (optional) Username for HTTP Authentication
-   **password** (optional) Password for HTTP Authentication
-   **sendImmediately** (optional) Send Username & Password Immediately. Defaults to false.

### HTTP server mode

Start a HTTP server to listen incoming PubSubHubbub requests

```javascript
// listen on port 1337
pubSubSubscriber.listen(1337);
```

### Express middleware mode

If you dot want to spin up a dedicated HTTP server, you can use the PubSubHubbub
subscriber as an Express middleware.

Attach PubSubHubbub object to an Express server using `listener` method.

```
// use the same path as defined in callbackUrl
app.use("/pubsubhubbub", pubSubSubscriber.listener());
```

## Events

-   **'listen'** - HTTP server has been set up and is listening for incoming connections
-   **'error'** (_err_) - An error has occurred
-   **'subscribe'** (_data_) - Subscription for a feed has been updated
-   **'unsubscribe'** (_data_) - Subscription for a feed has been cancelled
-   **'denied'** (_data_) - Subscription has been denied
-   **'feed'** (_data_) - Incoming notification

## API

### Listen

Start listening on selected port

    pubSubSubscriber.listen(port)

Where

-   **port** is the HTTP port to listen

### Subscribe

Subscribe to a feed with

    pubSubSubscriber.subscribe(topic, hub)

Where

-   **topic** is the URL of the RSS/ATOM feed to subscribe to
-   **hub** is the hub for the feed

Example:

    var pubSubSubscriber = pubSubHubbub.createServer(options);
    var topic = "http://testetstetss.blogspot.com/feeds/posts/default";
    var hub = "http://pubsubhubbub.appspot.com/";

    pubSubSubscriber.on("subscribe", function(data){
        console.log(data.topic + " subscribed");
    });

    pubSubSubscriber.listen(port);

    pubsub.on("listen", async function(){
		try {
        	await pubSubSubscriber.subscribe(topic, hub);
		} catch (err) {
			console.error(err);
		}
    });

### Unsubscribe

Unsubscribe from a feed with

    pubSubSubscriber.unsubscribe(topic, hub)

Where

-   **topic** is the URL of the RSS/ATOM feed to unsubscribe from
-   **hub** is the hub for the feed

Example:

    var pubSubSubscriber = pubSubHubbub.createServer(options),
        topic = "http://testetstetss.blogspot.com/feeds/posts/default",
        hub = "http://pubsubhubbub.appspot.com/";

    pubSubSubscriber.on("unsubscribe", function(data){
        console.log(data.topic + " unsubscribed");
    });

    pubSubSubscriber.listen(port);

    pubSubSubscriber.on("listen", async function(){
		try {
        	await pubSubSubscriber.unsubscribe(topic, hub);
		} catch (err) {
			console.error(err);
		}
    });

## Notifications

Update notifications can be checked with the `'feed'` event. The data object is with the following structure:

-   **topic** - Topic URL
-   **hub** - Hub URL, might be undefined
-   **callback** - Callback URL that was used by the Hub
-   **feed** - Feed XML as a Buffer object
-   **headers** - Request headers object

## License

**MIT**
