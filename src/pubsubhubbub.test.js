/* eslint no-unused-expressions: 0 */

import { createHmac } from 'crypto';
import got from 'got';
import { createServer } from './pubsubhubbub.js';

let pubsub = createServer({
	callbackUrl: 'http://localhost:8000/callback',
	secret: 'MyTopSecret',
	username: 'Test',
	password: 'P@ssw0rd',
	sendImmediately: true,
});

let response_body = 'This is a response.';
let hub_encryption = createHmac('sha1', pubsub.secret).update(response_body).digest('hex');

describe('pubsubhubbub notification', () => {
	beforeEach(() => {
		pubsub.listen(8000);
	});

	afterEach(() => {
		pubsub.server.close();
	});

	it('should return 400 - no topic', async () => {
		let options = {
			url: 'http://localhost:8000',
			headers: {
				link: '<http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
		};
		try {
			await got.post(options);
		} catch {
			return;
		}
		throw new Error('Should have thrown');
	});

	it('should return 403 - no X-Hub-Signature', async () => {
		let options = {
			url: 'http://localhost:8000',
			headers: {
				link: '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
		};
		try {
			await got.post(options);
		} catch {
			return;
		}
		throw new Error('Should have thrown');
	});

	it('should return 202 - signature does not match', async () => {
		let options = {
			url: 'http://localhost:8000',
			headers: {
				'X-Hub-Signature': 'sha1=' + hub_encryption,
				link: '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
			body: response_body + 'potentially malicious content',
		};
		const res = await got.post(options);
		expect(res.statusCode).toEqual(202);
	});

	it('should return 204 - sucessful request', async () => {
		let options = {
			url: 'http://localhost:8000',
			headers: {
				'X-Hub-Signature': 'sha1=' + hub_encryption,
				link: '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
			body: response_body,
		};
		const res = await got.post(options);
		expect(res.statusCode).toEqual(204);
	});

	it('should return 204 (without quotations on the rel) - successful request', async () => {
		let options = {
			url: 'http://localhost:8000',
			headers: {
				'X-Hub-Signature': 'sha1=' + hub_encryption,
				link: '<http://test.com>; rel=self, <http://pubsubhubbub.appspot.com/>; rel=hub',
			},
			body: response_body,
		};

		const res = await got.post(options);
		expect(res.statusCode).toEqual(204);
	});

	it('should emit a feed event - successful request', (done) => {
		let eventFired = false;
		let options = {
			url: 'http://localhost:8000',
			headers: {
				'X-Hub-Signature': 'sha1=' + hub_encryption,
				link: '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
			body: response_body,
		};
		got.post(options);

		pubsub.on('feed', () => {
			eventFired = true;
		});

		setTimeout(() => {
			expect(eventFired).toEqual(true);
			done();
		}, 10);
	});

	it('should not emit a feed event - signature does not match', (done) => {
		let eventFired = false;
		let options = {
			url: 'http://localhost:8000',
			headers: {
				'X-Hub-Signature': 'sha1=' + hub_encryption,
				link: '<http://test.com>; rel="self", <http://pubsubhubbub.appspot.com/>; rel="hub"',
			},
			body: response_body + 'potentially malicious content',
		};
		got.post(options);

		pubsub.on('feed', () => {
			eventFired = true;
		});

		setTimeout(() => {
			expect(eventFired).toEqual(false);
			done();
		}, 10);
	});
});

describe('pubsubhubbub creation', () => {
	it('pubsub should exist', () => {
		expect(pubsub).toBeTruthy();
	});

	it('options passed correctly', () => {
		expect(pubsub.callbackUrl).toEqual('http://localhost:8000/callback');
		expect(pubsub.secret).toEqual('MyTopSecret');
	});

	it('create authentication object', () => {
		expect(pubsub.auth).toBeTruthy();
		expect(pubsub.auth.user).toEqual('Test');
		expect(pubsub.auth.pass).toEqual('P@ssw0rd');

		expect(pubsub.auth).toEqual({
			user: 'Test',
			pass: 'P@ssw0rd',
			sendImmediately: false || true,
		});
	});
});
