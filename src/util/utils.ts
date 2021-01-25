
import {PropertyAlias} from "./default_property_alias";

export function addPropertyAlias(...str: Array<string>) : number {
    let currentLength = Object.values(PropertyAlias).length;
    for (const item of str) {
        PropertyAlias[++currentLength] = item;
    }
    return currentLength;
}