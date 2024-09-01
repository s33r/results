import { GeneralError } from './GeneralError.js';

// All external dependencies should be type only imports
import type z from 'zod';
import { type ParseError } from 'jsonc-parser';


/**
 * Creates a GeneralError from a http Response object
 * @param response the Response object returned from the fetch request.
 * @param source An optional source for error
 * @returns
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

export const fromString = (
    message: string,
    source?: string,
): GeneralError => new GeneralError({
    message,
    source,
});

export const fromJsoncError = (
    error: ParseError,
    source?: string,
): GeneralError => new GeneralError({
    code   : error.error.toString(),
    message: 'This library does not support inline error message, they must be looked up using printParseErrorCode',
    source,
});

export const fromZodIssue = (
    issue: z.ZodIssue,
    source?: string,
): GeneralError => new GeneralError({
    message : issue.message,
    location: issue.path.join('.'),
    code    : issue.code,
    source,
});
