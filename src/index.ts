import {Model} from "mongoose";
import {AggregateWithPaginationParams} from "./interfaces/defaultOperation.interfaces";


/**
 * @author KhalitovAdel
 * @link https://github.com/KhalitovAdel
 */
export class DefaultMongooseOperations {
    private readonly model!: Model<any>;
    constructor(model: Model<any>) {
        this.model = model;
    }

    public async aggregateWithPagination(params?: AggregateWithPaginationParams) {
        const limit = params?.options?.limit || Number.MAX_SAFE_INTEGER;
        const skip = params?.options?.skip
            ? params?.options?.skip * limit : 0;
        const { aggregatedCount, document } = (await this.model.aggregate([
            {
                $match: params?.match || {}
            },
            ...DefaultMongooseOperations.createProjection(params?.project),
            {
                $facet: {
                    document: [
                        {
                            $match: {_id: {$exists: true}},
                        },
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        },
                    ],
                    aggregatedCount: [{$count: 'count'}]
                }
            }
        ])).find(el => el);
        const count = (aggregatedCount as {count: number}[]).map(el => el.count).find(el => el) || 0
        return {
            count: Math.ceil(count / (params?.options?.limit || 1)),
            data: document
        }
    }

    private static createProjection(projection?: {[key: string]: -1 | 0 | 1}) {
        if (!projection || (typeof projection === 'object' && Object.keys(projection).length === 0)) {
            return [];
        }
        return [
            {
                $project: projection
            }
        ]
    }
}