import {ABlobLink} from "./ABlobLink";
import {AMetadata} from "./AMetadata";

export abstract class AResult {

    abstract get metadata(): AMetadata;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a Blob object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {B}
     * the blob object for column value
     */
    public abstract getBlob(i: number): null | ABlobLink;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a Blob object
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {B}
     * the blob object for column value
     */
    public abstract getBlob(name: string): null | ABlobLink;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a string
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {string}
     * the column value; if the value is SQL NULL, the value returned is empty string
     */
    public abstract getString(i: number): string;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a string
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {string}
     * the column value; if the value is SQL NULL, the value returned is empty string
     */
    public abstract getString(name: string): string;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a number
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {number}
     * the column value; if the value is SQL NULL, the value returned is 0
     */
    public abstract getNumber(i: number): number;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a number
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {number}
     * the column value; if the value is SQL NULL, the value returned is 0
     */
    public abstract getNumber(name: string): number;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a boolean
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean}
     * the column value; if the value is SQL NULL, the value returned is false
     */
    public abstract getBoolean(i: number): boolean;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a boolean
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {boolean}
     * the column value; if the value is SQL NULL, the value returned is false
     */
    public abstract getBoolean(name: string): boolean;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a Date object
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {null | Date}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getDate(i: number): null | Date;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a Date object
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {null | Date}
     * the column value; if the value is SQL NULL, the value returned is null
     */
    public abstract getDate(name: string): null | Date;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a any type
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {any}
     * the column value
     */
    public abstract getAny(i: number): any;

    /**
     * Retrieves the value of the designated column in the current
     * row of this Result object as a any type
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {any}
     * the column value
     */
    public abstract getAny(name: string): any;

    /**
     * Retrieves the values of all columns in the current
     * row of this Result object as a any type
     *
     * @returns {any[]}
     * the array of columns values
     */
    public abstract getAll(): any[];

    /**
     * Testing a column for null value.
     *
     * @param {number} i
     * the first column is 0, the second is 1, ...
     * @returns {boolean}
     * true, if value is null;
     * false, if value is not null
     */
    public abstract isNull(i: number): boolean;

    /**
     * Testing a column for null value.
     *
     * @param {string} name
     * the label for the column specified with the SQL AS clause.
     * If the SQL AS clause was not specified, then the label is
     * the name of the column
     * @returns {boolean}
     * true, if value is null;
     * false, if value is not null
     */
    public abstract isNull(name: string): boolean;
}
