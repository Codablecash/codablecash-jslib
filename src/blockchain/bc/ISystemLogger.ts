import { Exception } from "../../db/base/Exception";

export abstract class ISystemLogger{

	public abstract logException(e : Exception) : void;
	public abstract log(message : string) : void;

	public abstract debugLog(section : number, message : string, srcfile : string, srcline : number) : void;
}