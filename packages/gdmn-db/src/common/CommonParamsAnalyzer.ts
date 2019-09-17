import {IParams} from "../AStatement";

interface ITmpPlaceholders {
    [placeholder: string]: string;
}

export class CommonParamsAnalyzer {

    private readonly _originalSql: string;
    private readonly _placeholdersNames: string[] = [];
    private readonly _tmpPlaceholders: ITmpPlaceholders = {};
    private readonly _sql: string;

    constructor(originalSql: string, excludePatterns: RegExp[], placeholderPattern: RegExp) {
        this._originalSql = originalSql;

        let shortSql = excludePatterns.reduce((sql, excludePattern) => {
            return sql.replace(excludePattern, (str) => {
                const key = this._generateName();
                this._tmpPlaceholders[key] = str;
                return key;
            });
        }, this._originalSql);

        shortSql = shortSql.replace(placeholderPattern, (placeholder) => {
            this._placeholdersNames.push(placeholder.replace(":", ""));
            return "?".padEnd(placeholder.length); // for correct position sql errors
        });

        this._sql = Object.entries(this._tmpPlaceholders)
            .reverse()
            .reduce((sql, [key, value]) => sql.replace(key, value), shortSql);
    }

    get originalSql(): string {
        return this._originalSql;
    }

    get sql(): string {
        return this._sql;
    }

    get paramNameList(): string[] {
        return this._placeholdersNames;
    }

    public prepareParams(params?: IParams): any[] {
        if (!params) {
            return [];
        }
        if (Array.isArray(params)) {
            return params;
        }

        return this._placeholdersNames.map((placeholder) => {
            if (placeholder in params) {
                return params[placeholder];
            } else {
                throw new Error("Missing value for statement.\n" +
                    `"${placeholder}" not provided for statement:\n\n${this._sql}\n\n` +
                    `this was provided: ${JSON.stringify(params)}`);
            }
        });
    }

    private _generateName(count: number = Object.keys(this._tmpPlaceholders).length): string {
        const name = `$${count}`;
        if (this._originalSql.search(name) !== -1) {
            return this._generateName(count + 1);
        }
        return name;
    }
}
