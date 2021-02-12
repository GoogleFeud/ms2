import { WalkerCollection } from "..";
import Estree from "estree";

const StatementWalkers: WalkerCollection = {};

StatementWalkers["BlockStatement"] = (el: Estree.BlockStatement) => {
    console.log("Block statement!");
}

export default StatementWalkers;