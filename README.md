# http-request-queue

http-request-queue is a small utility used to limit the number of concurrent, "in-flight", http requests. It wraps the popular [request.js](https://github.com/request/request) javascript HTTP request library. This was built for [Sia-UI](https://github.com/NebulousLabs/Sia-UI) to manage a large number of concurrent API requests on systems with very low file descriptor limits (macOS defaults at 256!).

## Example Usage

```js
import rqueue from 'http-request-queue'

// create a request queue with a maximum of 10 concurrent requests
const queue = rqueue(10)

// make a request using the new request queue. request takes a normal
// request.js `opts` parameter, which can be an object or a string. See the
// upstream request.js documentation for more information. request returns a
// promise which can be used directly, or with async/await.
rqueue.request('http://localhost/foo')
	.then((res) => {
		// res is an object containing the fields { response, body }
		console.log(res.body)
		console.log(res.response)
	})
	.catch((err) => {
		// do something with err
	})

```

## License

The MIT License (MIT)
