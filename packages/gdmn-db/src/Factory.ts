import {ADriver} from "./ADriver";
import {Driver} from "./fb/Driver";

export abstract class Factory {

    /** Firebird driver */
    static get FBDriver(): ADriver {
        return new Driver();
    }
}
