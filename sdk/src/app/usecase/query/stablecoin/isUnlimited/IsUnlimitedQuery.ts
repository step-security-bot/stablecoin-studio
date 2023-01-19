import { Query } from "../../../../../core/query/Query.js";
import { QueryResponse } from "../../../../../core/query/QueryResponse.js";
import { HederaId } from "../../../../../domain/context/shared/HederaId.js";


export class IsUnlimitedQueryResponse implements QueryResponse {
	constructor(public readonly payload: boolean) {}
}

export class IsUnlimitedQuery extends Query<IsUnlimitedQueryResponse> {
	constructor(
		public readonly targetId: HederaId,
		public readonly tokenId: HederaId,
	) {
		super();
	}
}
