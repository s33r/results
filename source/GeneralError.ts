
const getLocation = (): string => {
    const error = new Error();

    if (error.stack) {
        return error.stack;
    } else {
        return '';
    }
};

/**
 * Plain JavaScript object that represents a GeneralError
 */
export type GeneralErrorBag = {
    message : string;
    location: string;
    source  : string;
    code    : string;
};

/**
 * A GeneralError is a common data structure for error data that comes from a variety of sources.
 */
export default class GeneralError {
    readonly #code    : string;
    readonly #message : string;
    readonly #location: string;
    readonly #source  : string;

    static toString(data: GeneralError | Array<GeneralError>): string;

    /**
     * Converts one or more GeneralErrors to a string.
     * @param data One or more GeneralErrors to convert
     * @param delimiter An optional value used to separate errors if there are more tha one.
     * @returns
     */
    static toString(
        data: GeneralError | Array<GeneralError>,
        delimiter = '\n',
    ): string {
        if (Array.isArray(data)) {
            return data.map(this.toString).join(delimiter);
        } else {
            const code = data.code ? `[${ data.code } ${ data.source }] ` : '';
            const location = data.location ? `[${ data.location }] ` : '';

            return `${ code }${ location }${ data.message }`;
        }
    }

    /**
     * Converts a General error into a plain JavaScript object.
     * @param data The GeneralError to convert
     */
    static toBag(
        data: GeneralError,
    ): GeneralErrorBag {
        return {
            code    : data.code,
            message : data.message,
            location: data.location,
            source  : data.source,
        };
    }

    /**
     * Given a map of codes, set the message of an error to the value of the map based on its code.
     * Very useful when localizing error messages.
     * @param data The GeneralError to translate
     * @param codeMap A map that links error codes to a message.
     */
    static translate(
        data: GeneralError,
        codeMap: Map<string, string>,
    ): GeneralError {
        return new GeneralError({
            ...this.toBag(data),
            message: codeMap.get(data.code) ?? data.message,
        });
    }

    constructor(
        data: Partial<GeneralErrorBag> & Pick<GeneralErrorBag, 'message'>,
    ) {
        this.#code = data.code ?? '';
        this.#message = data.message;
        this.#location = data.location ?? getLocation();
        this.#source = data.source ?? '';
    }

    /** The code is unique identifier for this kind of error. */
    get code() { return this.#code; }

    /** A user friendly description of this error.  */
    get message() { return this.#message; }

    /** The location where this error occurred. */
    get location() { return this.#location; }

    /** The cause of this error. */
    get source() { return this.#source; }

    /** Converts this General error into a string  */
    toString() { return GeneralError.toString(this); }

    /** Converts this General error into a plain JavaScript object.  */
    toBag() { return GeneralError.toBag(this); }
}
