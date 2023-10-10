/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { IncomingMessage } from 'http';
import * as https from 'https';

import {
	SignChallenge,
	SignedChallenge,
	UserActionSignatureChallenge,
	WithRequired,
} from './types';

import crypto from 'crypto';

// The nonce (required for all requests) helps to ensure a request can only be run once.
const generateNonce = (): string => {
	return Buffer.from(
		JSON.stringify({
			date: new Date().toISOString(),
			uuid: crypto.randomUUID(),
		}),
	).toString('base64url');
};

// HTTP wrapper that adds the required headers.
const makeDfnsHttpRequest = async <ResponseType>(
	method: 'POST' | 'GET' | 'PUT' | 'DELETE',
	resource: string,
	body: string,
	userActionSignature = '',
): Promise<ResponseType> => {
	// This is the ID of the Application created on the dashboard.
	const appId = 'ap-b6uj2-95t58-55o0cprm1lqqkpn';

	// Replace this with api.dfns.io, if targeting the production environment.
	const target = 'api.dfns.ninja';

	// The JWT you saved when creating the Auth V2 API Key
	const apiKeyJwt =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai00ODNxcC04ZTlsbi05amJiOW5lZ2Q2OWZjaXZuIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6WyJBcGlLZXlzOkNyZWF0ZSIsIkFwaUtleXM6UmVhZCIsIkFwaUtleXM6UmV2b2tlIiwiQXNzZXRBY2NvdW50czpBcmNoaXZlIiwiQXNzZXRBY2NvdW50czpDcmVhdGUiLCJBc3NldEFjY291bnRzOlJlYWQiLCJBdXRoOkFjdGlvbjpTaWduIiwiQXV0aDpBcHBzOkNyZWF0ZSIsIkF1dGg6QXBwczpSZWFkIiwiQXV0aDpBcHBzOlVwZGF0ZSIsIkF1dGg6VHlwZXM6QXBwbGljYXRpb24iLCJBdXRoOlR5cGVzOkVtcGxveWVlIiwiQXV0aDpUeXBlczpFbmRVc2VyIiwiQXV0aDpUeXBlczpQYXQiLCJBdXRoOlR5cGVzOlNlcnZpY2VBY2NvdW50IiwiQXV0aDpVc2VyczpDcmVhdGUiLCJBdXRoOlVzZXJzOkRlbGVnYXRlIiwiQXV0aDpVc2VyczpSZWFkIiwiQXV0aDpVc2VyczpVcGRhdGUiLCJBdXRoOkNyZWRzOkNyZWF0ZSIsIkF1dGg6Q3JlZHM6UmVhZCIsIkF1dGg6Q3JlZHM6VXBkYXRlIiwiQmFsYW5jZXM6UmVhZCIsIkNhbGxiYWNrRXZlbnRzOlJlYWQiLCJDYWxsYmFja1N1YnNjcmlwdGlvbnM6QXJjaGl2ZSIsIkNhbGxiYWNrU3Vic2NyaXB0aW9uczpDcmVhdGUiLCJDYWxsYmFja1N1YnNjcmlwdGlvbnM6UmVhZCIsIkVtcGxveWVlczpSZWFkIiwiUGF5bWVudHM6Q3JlYXRlIiwiUGF5bWVudHM6UmVhZCIsIlBlcm1pc3Npb25Bc3NpZ25tZW50czpDcmVhdGUiLCJQZXJtaXNzaW9uQXNzaWdubWVudHM6UmVhZCIsIlBlcm1pc3Npb25Bc3NpZ25tZW50czpSZXZva2UiLCJQZXJtaXNzaW9uUHJlZGljYXRlczpBcmNoaXZlIiwiUGVybWlzc2lvblByZWRpY2F0ZXM6Q3JlYXRlIiwiUGVybWlzc2lvblByZWRpY2F0ZXM6UmVhZCIsIlBlcm1pc3Npb25QcmVkaWNhdGVzOlVwZGF0ZSIsIlBlcm1pc3Npb25zOkFyY2hpdmUiLCJQZXJtaXNzaW9uczpDcmVhdGUiLCJQZXJtaXNzaW9uczpSZWFkIiwiUGVybWlzc2lvbnM6VXBkYXRlIiwiUG9saWNpZXM6QXJjaGl2ZSIsIlBvbGljaWVzOkNyZWF0ZSIsIlBvbGljaWVzOlJlYWQiLCJQb2xpY2llczpVcGRhdGUiLCJQb2xpY3lDb250cm9sRXhlY3V0aW9uczpSZWFkIiwiUG9saWN5Q29udHJvbEV4ZWN1dGlvbnM6VXBkYXRlIiwiUG9saWN5Q29udHJvbHM6QXJjaGl2ZSIsIlBvbGljeUNvbnRyb2xzOkNyZWF0ZSIsIlBvbGljeUNvbnRyb2xzOlJlYWQiLCJQb2xpY3lDb250cm9sczpVcGRhdGUiLCJQb2xpY3lSdWxlczpBcmNoaXZlIiwiUG9saWN5UnVsZXM6Q3JlYXRlIiwiUG9saWN5UnVsZXM6UmVhZCIsIlBvbGljeVJ1bGVzOlVwZGF0ZSIsIlB1YmxpY0tleUFkZHJlc3NlczpSZWFkIiwiUHVibGljS2V5czpDcmVhdGUiLCJQdWJsaWNLZXlzOlJlYWQiLCJTaWduYXR1cmVzOkNyZWF0ZSIsIlNpZ25hdHVyZXM6UmVhZCIsIlRyYW5zYWN0aW9uczpDcmVhdGUiLCJUcmFuc2FjdGlvbnM6UmVhZCIsIldhbGxldHM6Q3JlYXRlIiwiV2FsbGV0czpSZWFkIiwiV2FsbGV0czpHZW5lcmF0ZVNpZ25hdHVyZSIsIldhbGxldHM6UmVhZFNpZ25hdHVyZSIsIldhbGxldHM6QnJvYWRjYXN0VHJhbnNhY3Rpb24iLCJXYWxsZXRzOlJlYWRUcmFuc2FjdGlvbiIsIldhbGxldHM6VHJhbnNmZXJBc3NldCIsIldhbGxldHM6UmVhZFRyYW5zZmVyIl0sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoibWlndWVsYW5nZWxAaW8uYnVpbGRlcnMiLCJodHRwczovL2N1c3RvbS9hcHBfbWV0YWRhdGEiOnsidXNlcklkIjoidXMtNGhjMXYtZnNjYW0tODA5YTBkODM3djhuOWZqciIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlRva2VuIn0sImlhdCI6MTY5NjgwMDYxNCwiZXhwIjoxNjk2ODIyMjE0fQ.OIL-i051gbDL9jb1epf7M24c32k1bIgKzHNt4Q7sFhPahJT8HRY9kN8EpaZa8FZaodUo81dV_x4aQlDYscLdDA';

	const options: WithRequired<https.RequestOptions, 'headers'> = {
		hostname: target,
		port: 443,
		path: resource,
		method: method,
		headers: {
			Accept: 'application/json',
			Authorization: 'Bearer ' + apiKeyJwt,
			'Content-Length': Buffer.byteLength(body),
			'Content-Type': 'application/json',
			Host: target,
			'User-Agent': 'My test Application',
			'X-DFNS-APPID': appId,
			'X-DFNS-NONCE': generateNonce(),
			'X-DFNS-USERACTION': userActionSignature,
		},
	};

	return new Promise((resolve, reject) => {
		let result = '';

		const handleRequest = (response: IncomingMessage) => {
			const { statusCode } = response;

			response.setEncoding('utf-8');
			response.on('data', (chunk) => {
				result += chunk;
			});

			const isStatus2xx =
				statusCode && statusCode >= 200 && statusCode < 300;

			response.on('end', () => {
				if (!isStatus2xx) {
					let errorMessage = response.statusMessage;
					if (!errorMessage && result) {
						try {
							errorMessage = JSON.parse(result).error.message;
						} catch {
							errorMessage = 'Unknown error';
						}
					}
					reject({
						statusCode: response.statusCode,
						message: errorMessage,
					});
				} else {
					try {
						if (result === '') {
							resolve({} as ResponseType);
						} else {
							resolve(JSON.parse(result) as ResponseType);
						}
					} catch (error) {
						reject(error);
					}
				}
			});
		};

		const request = https.request(options, handleRequest);

		request.on('error', (e) => {
			reject(e);
		});

		if (body !== '') {
			request.write(body);
		}

		request.end();
	});
};

// API Wrapper that handles the calling the user action signature endpoints when needed.
export const makeDfnsApiRequest = async <ResponseType>(
	method: 'POST' | 'GET' | 'PUT' | 'DELETE',
	apiPath: string,
	requestPayload: any,
	signChallengeCallback?: SignChallenge,
): Promise<ResponseType> => {
	let userActionSignature: string | undefined;

	if (signChallengeCallback) {
		const createUserActionSignaturePayload: {
			userActionPayload: string;
			userActionHttpMethod: string;
			userActionHttpPath: string;
		} = {
			userActionPayload: JSON.stringify(requestPayload),
			userActionHttpMethod: method,
			userActionHttpPath: apiPath,
		};

		console.log(
			'createUserActionSignaturePayload: ' +
				JSON.stringify(createUserActionSignaturePayload),
		);
		// First call gets the challenge from the Dfns system.
		const challenge =
			await makeDfnsHttpRequest<UserActionSignatureChallenge>(
				'POST',
				'/auth/action/init',
				JSON.stringify(createUserActionSignaturePayload),
			);
		console.log('challenge: ' + JSON.stringify(challenge));
		// The user will sign this challenge.
		const credentialAssertion = await signChallengeCallback(challenge);

		const userActionPayload: {
			challengeIdentifier: string;
			firstFactor: {
				kind: 'Fido2' | 'Key' | 'Password' | 'Totp' | 'RecoveryKey';
				credentialAssertion: SignedChallenge;
			};
		} = {
			challengeIdentifier: challenge.challengeIdentifier,
			firstFactor: {
				kind: 'Key',
				credentialAssertion: credentialAssertion,
			},
		};

		// Then the user exchanges the signed challenge for the user action signature.
		userActionSignature = (
			await makeDfnsHttpRequest<{
				userAction: string;
			}>('POST', '/auth/action', JSON.stringify(userActionPayload))
		).userAction;
	}

	// Finally, call to the desired API, passing the user action signature as proof that the request was authorized by the user.
	return await makeDfnsHttpRequest<ResponseType>(
		method,
		apiPath,
		JSON.stringify(requestPayload),
		userActionSignature,
	);
};
