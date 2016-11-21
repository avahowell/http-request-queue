import nock from 'nock'
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import request from 'request'

let requestCount = 0

const rqueue = proxyquire('../src/rqueue.js', {
	request: (opts, callback) => {
		requestCount++
		request(opts, callback)
	},
}).default

describe('rqueue', () => {
	beforeEach(() => {
		requestCount = 0
	})
	it('can succesfully request in parallel', function(done) {
		this.timeout(5000)
		const queue = rqueue(10)
		let complete = 0
		for (let i = 0; i < 20; i++) {
			nock('http://localhost/')
				.get('/')
				.delay(Math.random() * 100)
				.reply(200)

			queue.request('http://localhost/')
				.then(() => {
					complete++
					if (complete === 20) {
						done()
					}
				})
				.catch((err) => {
					throw err
				})
		}
	})
	it('doesnt make more than size concurrent requests', async function() {
		this.timeout(10000)

		let complete = 0
		const queue = rqueue(10)
		for (let i = 0; i < 10; i++) {
			nock('http://localhost/')
				.get('/')
				.delay(2000)
				.reply(200)

			queue.request('http://localhost/')
				.then(() => {
					complete++
				})
		}

		expect(queue.inflightRequests()).to.equal(10)
		expect(requestCount).to.equal(10)

		for (let i = 0; i < 10; i++) {
			nock('http://localhost/')
				.get('/')
				.delay(2000)
				.reply(200)

			queue.request('http://localhost/')
				.then(() => {
					complete++
				})

			expect(requestCount <= 10).to.be.true
		}

		expect(queue.inflightRequests()).to.equal(10)

		while (complete < 20) {
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		expect(requestCount).to.equal(20)
	})
	it('decrements inflight if a call fails', async () => {
		const queue = rqueue(10)
		nock('http://localhost/')
			.get('/')
			.replyWithError('bad')

		try {
			await queue.request('http://localhost/')
		} catch (e) {
		}

		expect(requestCount).to.equal(1)
		expect(queue.inflightRequests()).to.equal(0)
	})
	it('returns res and body objects on success', async () => {
		const queue = rqueue(10)
		nock('http://localhost/')
			.get('/')
			.reply(200, 'testbody')

		const res = await queue.request('http://localhost/')
		expect(res.body).to.equal('testbody')
		expect(res.response.statusCode).to.equal(200)
	})
})
