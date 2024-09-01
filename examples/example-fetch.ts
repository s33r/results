import { fromNativeError, fromResponse, fromString } from "../source/error-factories";
import { GeneralError } from "../source/GeneralError";
import { failure, ResultContainer, success, unwrap } from "../source/ResultContainer";

type Photograph = {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
}

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

const createPhotoMap = (
    data: unknown,
): Map<number, Photograph> => {
    const photos = new Map<number, Photograph>();

    // THis would be a good place to actually validate the returned data and return a ResultContainer 
    // with it, but thats beyond the scope of this example.
    const unvalidatedData = data as Array<Photograph>;

    unvalidatedData.forEach(photo => photos.set(photo.id, photo));
    
    return photos;
}

const getPhotograph = (
    id: number,
    photos: Record<string, Photograph>
): ResultContainer<Photograph> => {
    if(photos[id]) {
        return success(photos[id]);
    } else {
        return failure(new GeneralError(fromString(`Photo ${id} not found`)));
    }
}

(async () => {
    const goodUrl = 'https://jsonplaceholder.typicode.com/photos';

    // Since the whole thing is a bust if we can't get the list of photos, just unwrap the result. This will throw if there is an error.
    const result = unwrap(await getData(goodUrl));

    // Create a map of photos based on their id
    const photoMap = createPhotoMap(result);

    
})