export class InvalidStateError extends Error {
	
	constructor(message: string, ...params: any[]) {
		super(...params);
		
		this.name = "InvalidStateError";
		this.message = message;
	}
	
}