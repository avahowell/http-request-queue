# http-request-queue

http-request-queue is a small module used to limit the number of concurrent, "in-flight", http requests. It wraps the popular [request.js](https://github.com/request/request) javascript HTTP request library. This was built for [Sia-UI](https://github.com/NebulousLabs/Sia-UI) to manage a large number of concurrent API requests on systems with very low file descriptor limits (macOS defaults at 256!).

http-request-queue exposes a default function which takes one parameter, limit, which determines how many requests are allowed to run concurrently. If this limit is reached and another request is made, the additional request will be delayed until the current number of in flight requests dips below the limit.

## Example Usage

```js
import rqueue from 'http-request-queue'

// create a request queue with a maximum of 10 concurrent requests
const queue = rqueue(10)

// make a request using the new request queue. request takes a normal
// request.js `opts` parameter, which can be an object or a string. See the
// upstream request.js documentation for more information. request returns a
// promise which can be used directly, or with async/await.
queue.request('http://localhost/foo')
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
