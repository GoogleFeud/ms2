
import {PropertyAlias} from "./default_property_alias";

export function addPropertyAlias(...str: Array<string>) : Array<number> {
    let currentLength = Object.values(PropertyAlias).length;
    const results = [];
    for (const item of str) {
        PropertyAlias[++currentLength] = item;
        results.push(currentLength);
    }
    return results;
}