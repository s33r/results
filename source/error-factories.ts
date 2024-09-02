import GeneralError from './GeneralError.js';

// All external dependencies should be type only imports
import type z from 'zod';
import { type ParseError } from 'jsonc-parser';


/**
 * Creates a GeneralError from a http Response object
 * @param response the Response object returned from the fetch request.
 * @param source AAn optional source of the error.
 */
export const fromResponse = (
    response: Response,
    source? : string,
): GeneralError => new GeneralError({
    message : response.statusText,
    code    : response.status.toString(),
    location: response.url,
    source,
});

/**
 * Creates a GeneralError from the built in JavaScript Error object
 * @param error The error object to convert.
 * @param source An optional source of the error.
 */
export const fromNativeError = (
    error: unknown,
    source?: string,
): GeneralError => {
    if (error instanceof Error) {
        return new GeneralError({
            message : error.message,
            code    : error.name,
            location: error.stack,
            source,
        });
    } else {
        return new GeneralError({
            message: `${ error }`,
            source,
        });
    }
};

/**
 * Creates a GeneralError from an error message.
 * @param message The message to give the error.
 * @param source An optional source of the error.
 */
export const fromString = (
    message: string,
    source?: string,
): GeneralError => new GeneralError({
    message,
    source,
});

/**
 * Creates a GeneralError from a jsonc-parser ParseError
 *
 * *Note*: Since the ParseErrors only contain an error code, the message is not available without manually calling printParseErrorCode and padding in the code.
 * @param error The ParseError to convert.
 * @param source An optional source of the error.
 */
export const fromJsoncError = (
    error: ParseError,
    source?: string,
): GeneralError => new GeneralError({
    code   : error.error.toString(),
    message: 'This library does not support inline error message, they must be looked up using printParseErrorCode',
    source,
});

/**
 * Creates a GeneralError from a ZodIssue
 * @param issue The ZodIssue to convert.
 * @param source An optional source of the error.
 */
export const fromZodIssue = (
    issue: z.ZodIssue,
    source?: string,
): GeneralError => new GeneralError({
    message : issue.message,
    location: issue.path.join('.'),
    code    : issue.code,
    source,
});
