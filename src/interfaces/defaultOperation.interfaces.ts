

export interface AggregateWithPaginationParams {
    readonly match?: any;
    readonly project?: {[key: string]: -1 | 0 | 1};
    readonly options?: {
        readonly limit?: number;
        readonly skip?: number;
    }
}