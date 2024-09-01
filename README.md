# general-errors
General error handling utilities

 Utilities for handling errors. There are two major components:

 - ResultContainer is a data structure for representing the result of process, usually a function return value or data returned from an API.
 - GeneralError is a class for representing errors from various sources to a single data structure.


 ## ResultContainer

 A result container has a `success` field that is always either true or false. If it is true, then there will be a `data` filed with the return value. If it is false, there will be an `errors` filed which is an array of `GeneralErrors`. This structure is defined in TypeScript as a generic discriminated union so it is type aware. I strongly recommend enabling `strict` mode in TypeScript in order to use this structure ergonomically.

 In addition to the ResultContainer structure there are a number of helper functions that make it easy to create and work with ResultContainers.

 ## GeneralError

 The GeneralError class is meant to store data related to errors that developers typically need. 