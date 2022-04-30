/**
* Iterate through a TypeScript enum.
* @yields The next value in the enum - e.g. 0, 1, etc
*/
export function* iterateEnum(enumerable: any) {
	for (let i in enumerable) {
		if (isNaN(parseFloat(i))) yield enumerable[i];
	}
}
