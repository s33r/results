import GeneralError from './GeneralError.js';

const convertError = (
    error: string | GeneralError,
    source?: string,
): GeneralError => {
    if (typeof error === 'string') {
        return new GeneralError({ message: error, source });
    } else {
        return new GeneralError({
            ...GeneralError.toBag(error),
            source: error.source || source,
        });
    }
};

/**
 * The result of a process that failed 😭
 */
export type FailureResult = {
    success: false;
    errors : Array<GeneralError>;
};

/**
 * The result of a process that succeeded 🥰
 */
export type SuccessResult<T = null> = {
    success: true;
    data   : T;
};

/**
 * The result of a process. May be either a FailureResult or a SuccessResult<T>
 */
export type ResultContainer<T = null> = FailureResult | SuccessResult<T>;

/**
 * Unwraps a result container by getting the data from a successful result or throws an exception.
 * @param result The ResultContainer to unwrap
 * @param source An optional source for errors that don't have one already set.
 * @returns Returns the actual value fo the result.
 */
export const unwrap = <T = null>(
    result: ResultContainer<T>,
    source?: string,
): T => {
    if (result.success) {
        return result.data;
    } else {
        throw new Error(GeneralError.toString(result.errors.map(e => convertError(e, source))));
    }
};

/**
 * Creates a successful ResultContainer with the provided data.
 * @param data The data to include in the ResultContainer
 * @returns A successful ResultContainer with the provided data.
 */
export const success = <T = null>(
    data: T,
): ResultContainer<T> => ({
    success: true,
    data,
});

/**
 * Creates an unsuccessful ResultContainer with the provided Errors
 * @param errors The errors to include in the ResultContainer
 * @param source An optional source for errors that don't have one already set.
 * @returns An unsuccessful ResultContainer with the provided Errors
 */
export const failure = <T = null>(
    errors: ReadonlyArray<GeneralError | string> | string | GeneralError,
    source?: string,
): ResultContainer<T> => {
    if (errors instanceof GeneralError || typeof errors === 'string') {
        return {
            success: false,
            errors : [convertError(errors, source)],
        };
    } else {
        return {
            success: false,
            errors : errors.map(e => convertError(e, source)),
        };
    }
};

/**
 * Creates a ResultContainer based on provided data and errors.
 * @param data The data to include in the ResultContainer if there are no errors.
 * @param errors The errors to include in the ResultContainer
 * @param source An optional source for errors that don't have one already set.
 * @returns
 */
export const wrap = <T = null>(
    data?: T,
    errors?: Array<GeneralError | string>,
    source?: string,
): ResultContainer<T> => {
    if (errors && errors.length > 0) {
        return failure(errors, source);
    } else if (data === undefined) {
        return failure(new GeneralError({
            message: 'No value for data was provided, but no errors were either.',
            code   : 'UnknownError',
            source,
        }));
    } else {
        return success(data);
    }
};

/**
 * Consolidates an array of ResultContainers into a single ResultContainer. If any ResultContainers are failures, the result will be a failure too.
 * @param results The array of ResultContainers to consolidate.
 * @param source An optional source for errors that don't have one already set.
 * @returns
 */
export const collect = <T = null>(
    results: ReadonlyArray<ResultContainer<T>>,
    source?: string,
): ResultContainer<Array<T>> => {
    const errors: Array<GeneralError> = [];
    const data: Array<T> = [];

    results.forEach(result => {
        if (result.success) {
            data.push(result.data);
        } else {
            errors.push(...result.errors);
        }
    });

    return wrap(data, errors, source);
};

/**
 * Consolidates an array of ResultContainers into a single ResultContainer. If any ResultContainers are failures, they are excluded from the result.
 * @param results The array of ResultContainers to consolidate.
 * @param source An optional source for errors that don't have one already set.
 * @returns
 */
export const collectAny = <T = null>(
    results: ReadonlyArray<ResultContainer<T>>,
    source?: string,
): ResultContainer<Array<T>> => {
    const errors: Array<GeneralError> = [];
    const data: Array<T> = [];

    results.forEach(result => {
        if (result.success) {
            data.push(result.data);
        } else {
            errors.push(...result.errors);
        }
    });

    if (data.length > 0) {
        return success(data);
    } else {
        return failure(errors, source);
    }
};

/**
 * Consolidates an object or Map of ResultContainers into a single ResultContainer. If any ResultContainers are failures, the result will be a failure too.
 * @param results The results to compose into a single ResultContainer
 * @param source An optional source for errors that don't have one already set.
 * @returns
 */
export const compose = <T = null>(
    results: Readonly<Record<string, ResultContainer<T>>> | ReadonlyMap<string, ResultContainer<T>>,
    source?: string,
): ResultContainer<Record<string, T>> => {
    const result: Record<string, T> = {};
    const errors: Array<GeneralError> = [];

    const iterator = results instanceof Map ?
        results.entries() as IterableIterator<[string, ResultContainer<T>]> :
        Object.entries(results) as Array<[string, ResultContainer<T>]>;
    for (const [key, value] of iterator) {
        if (value.success) {
            result[key] = value.data;
        } else {
            errors.push(...value.errors);
        }
    }

    return wrap(result, errors, source);
};

/**
 * Consolidates an object or Map of ResultContainers into a single ResultContainer. If any ResultContainers are failures, they are excluded from the result.
 * @param results The results to compose into a single ResultContainer
 * @param source An optional source for errors that don't have one already set.
 * @returns
 */
export const composeAny = <T = null>(
    results: Readonly<Record<string, ResultContainer<T>>> | ReadonlyMap<string, ResultContainer<T>>,
    source?: string,
): ResultContainer<Record<string, T>> => {
    const data: Record<string, T> = {};
    const errors: Array<GeneralError> = [];

    const iterator = results instanceof Map ?
        results.entries() as IterableIterator<[string, ResultContainer<T>]> :
        Object.entries(results) as Array<[string, ResultContainer<T>]>;
    for (const [key, value] of iterator) {
        if (value.success) {
            data[key] = value.data;
        } else {
            errors.push(...value.errors);
        }
    }

    if (Object.keys(data).length > 0) {
        return success(data);
    } else {
        return failure(errors, source);
    }
};
