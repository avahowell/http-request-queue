import req from 'request'

const retryPollSpeed = 200

const reqpromise = (opts) => new Promise((resolve, reject) => {
	req(opts, (err, response, body) => {
		if (err) {
			reject(err)
		}
		resolve({response, body})
	})
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

