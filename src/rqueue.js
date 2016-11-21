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

const queue = (size = 10) => {
	let inflight = 0
	const request = async (opts) => {
		if (inflight < size) {
			inflight++
			const res = await reqpromise(opts)
			inflight--
			return res
		}
		await new Promise((resolve) => setTimeout(resolve, retryPollSpeed))
		return request(opts)
	}

	return {
		inflightRequests: () => inflight,
		request,
	}
}

export default queue

