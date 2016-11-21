import req from 'request'

// retryPollSpeed determines the interval at which enqueued requests are
// retried.
const retryPollSpeed = 200

// reqpromise promisifies request.js request calls.
const reqpromise = (opts) => new Promise((resolve, reject) => {
	req(opts, (err, response, body) => {
		if (err) {
			reject(err)
		}
		resolve({response, body})
	})
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// queue returns a http-request-queue object with a limit of concurrent
// requests determined by `size`.
const queue = (size = 10) => {
	let inflight = 0
	const request = async (opts) => {
		while (inflight >= size) {
			await sleep(retryPollSpeed)
		}
		inflight++
		try {
			const res = await reqpromise(opts)
			inflight--
			return res
		} catch (e) {
			inflight--
			throw e
		}
	}

	return {
		inflightRequests: () => inflight,
		request,
	}
}

export default queue

