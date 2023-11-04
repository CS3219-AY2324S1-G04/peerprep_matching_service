
/**
 * For matching.
 * Should follow the structure of the MongoDB collections closely.
 * More importantly, follow the question service closely. 
 */
export interface matchingUserInput {
    complexity: string,
    categories: string[],
    language : string
}