import { TypesResponse } from './types.response'
import { Metadata } from './metadata'

export { Metadata }

export class ApiResponse<T> {
    result?: T
    metadata?: Metadata
    type?: TypesResponse
    text?: string

    constructor(type: TypesResponse, text: string)
    constructor(result: T, type: TypesResponse, text: string)
    constructor(result: T, metadata: Metadata, type: TypesResponse, text: string)
    constructor(
        ...args:
            | [TypesResponse, string]
            | [T, TypesResponse, string]
            | [T, Metadata, TypesResponse, string]
    ) {
        if (args.length === 2) {
            const [type, text] = args as [TypesResponse, string]
            this.type = type
            this.text = text
        } else if (args.length === 3) {
            const [result, type, text] = args as [T, TypesResponse, string]
            this.result = result
            this.type = type
            this.text = text
        } else {
            const [result, metadata, type, text] = args as [T, Metadata, TypesResponse, string]
            this.result = result
            this.metadata = metadata
            this.type = type
            this.text = text
        }
    }
}
