# @ehwillows/general-errors

General error handling utilities.

[Documentation](https://ehwillows.com/general-errors)

 Utilities for handling errors. There are two major components:

 - ResultContainer is a data structure for representing the result of process, usually a function return value or data returned from an API.
 - GeneralError is a class for representing errors from various sources to a single data structure.




 ## ResultContainer

 A result container has a `success` field that is always either true or false. If it is true, then there will be a `data` filed with the return value. If it is false, there will be an `errors` filed which is an array of `GeneralErrors`. This structure is defined in TypeScript as a generic [discriminated union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions) so it is type aware. I strongly recommend enabling `strict` mode in TypeScript in order to use this structure ergonomically.

 In addition to the ResultContainer structure there are a number of helper functions that make it easy to create and work with ResultContainers.

 ### Try-Catch

 ```typescript
try {
    const data = JSON.parse(jsonText)

    return success(data);
} catch (error) {
    return failure(fromNativeError(error));
}
```

### Fetch Request
 ```typescript
/**
 * Makes a request to the API at the provided url and translates it to js data.
 * @param url the url to fetch.
 * @returns A ResultContainer with the returned data or errors.
 */
const getData = async (
    url: string
): Promise<ResultContainer<unknown>> => {
    const response = await fetch(url);

    if(response.ok) {
        // If response has an "ok" status code we will try to parse it as JSON.
        try {
            const data: unknown = await response.json();

            // If the response is successfully parsed, we return an error result who's `success` field
            // is true and the data is an unknown value that the API returned.
            return success(data);
        } catch(error) {

            // If the request fails to parse, we catch the returned Error and convert it to a
            // GeneralError then return a failure.
            return failure(fromNativeError(error, url))
        }
    } else {
        // If the Response is not "ok" then we convert it to a GeneralError and return the failure.
        return failure(fromResponse(response));
    }
}
```

 ## GeneralError

 The GeneralError class is meant to store data related to errors that developers typically need.